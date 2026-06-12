import { test } from "vitest";
import assert from "node:assert/strict";
import tests from "../evm.json" with { type: "json" };
import { Tx, State as EVM } from "./state.js";
import { UnimplementedOpcodeError } from "./errors.js";

type TestCase = {
  name: string;
  hint: string;
  tx?: {
    from: string;
    to: string;
    origin: string;
  };
  code: {
    asm: string;
    bin: string;
  };
  expect: {
    success: boolean;
    stack: string[];
  };
};

function run() {
  for (const t of tests as TestCase[]) {
    test(t.name, () => {
      const prog = hexStringToUint8Array(t.code.bin);
      const origin = BigInt(t.tx?.origin ?? 0);
      const from = BigInt(t.tx?.from ?? 0);
      const to = BigInt(t.tx?.to ?? 0);
      const tx: Tx = { origin: origin, from: from, to: to, value: 0n };
      const evm = new EVM(tx, prog, 21_000n);
      let success = true;

      try {
        evm.run();
        success = !evm.revertFlag;
      } catch (e) {
        if (e instanceof UnimplementedOpcodeError) {
          throw e;
        } else {
          success = false;
        }
      }

      assert.equal(success, t.expect.success);
      assertStackEqual(t, evm);
    });
  }
}

function assertStackEqual(t: TestCase, evm: EVM) {
  const expected = t.expect.stack;
  const actual = evm.stack
    .toArray()
    .reverse()
    .map((n) => "0x" + n.toString(16));
  try {
    assert.deepEqual(expected, actual);
  } catch (e) {
    throw new Error(
      `${e}\nHint: ${t.hint}\nASM: ${t.code.asm}\nExpected: ${expected}\nActual: ${actual}`,
    );
  }
}

function hexStringToUint8Array(hexString: string): Uint8Array {
  const clean = hexString.startsWith("0x") ? hexString.slice(2) : hexString;
  if (clean.length % 2 !== 0) {
    throw new Error(`invalid hex string: ${hexString}`);
  }

  let bytes = new Uint8Array(clean.length / 2);

  for (let i = 0; i < clean.length; i += 2) {
    const high = parseInt(clean[i], 16);
    const low = parseInt(clean[i + 1], 16);
    bytes[i / 2] = (high << 4) | low;
  }

  return bytes;
}

run();
