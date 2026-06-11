import { test } from "vitest";
import assert from "node:assert/strict";
import tests from "../evm.json" with { type: "json" };
import { State as EVM } from "./state.js";

type Case = {
  name: string;
  hint: string;
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
  const testAddress = BigInt(0x1337);
  const gas = 21_000n;
  const value = 0n;

  for (const t of tests as Case[]) {
    test(t.name, () => {
      const prog = hexStringToUint8Array(t.code.bin);
      const evm = new EVM(testAddress, prog, gas, value);

      evm.run();

      assertCompleted(t, evm);
      assertStackEqual(t, evm);
    });
  }
}

function assertCompleted(t: Case, evm: EVM) {
  try {
    assert.equal(completed(evm), t.expect.success);
  } catch (e) {
    console.log(evm.pc, evm.program.length);
    throw e;
  }
}

function assertStackEqual(t: Case, evm: EVM) {
  try {
    assert.deepEqual(
      t.expect.stack,
      evm.stack.items().map(n => '0x' + n.toString(16))
    );
  } catch (e) {
    throw new Error(`${e}\nHint: ${t.hint}\nASM: ${t.code.asm}`);
  }
}

function completed(evm: EVM): boolean {
  return evm.stopFlag || evm.pc === evm.program.length;
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
