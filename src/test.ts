import { test } from "vitest";
import assert from "node:assert/strict";
import tests from "../evm.json" with { type: "json" };
import { Tx, Block, EVM, Log } from "./evm.js";
import { worldState } from "./state.js";
import { UnimplementedOpcodeError } from "./errors.js";

type TestCase = {
  name: string;
  hint: string;
  state?: Record<
    string,
    { balance?: string; code?: { asm: string; bin: string } }
  >;
  block?: {
    basefee: string;
    coinbase: string;
    timestamp: string;
    number: string;
    difficulty: string;
    gaslimit: string;
    chainid: string;
  };
  tx?: {
    from: string;
    to: string;
    origin: string;
    gasprice: string;
    value: string;
    data: string;
  };
  code: {
    asm: string;
    bin: string;
  };
  expect: {
    success: boolean;
    stack: string[];
    return?: string;
    logs?: {
      address: string;
      data: string;
      topics: string[];
    }[];
  };
};

function run() {
  for (const t of tests as TestCase[]) {
    test(t.name, () => {
      const prog = hexToBytes(t.code.bin);
      const tx: Tx = {
        origin: BigInt(t.tx?.origin ?? 0),
        from: BigInt(t.tx?.from ?? 0),
        to: BigInt(t.tx?.to ?? 0),
        value: BigInt(t.tx?.value ?? 0),
        gasprice: BigInt(t.tx?.gasprice ?? 0),
        calldata: hexToBytes(t.tx?.data ?? ""),
        nonce: 0n,
      };
      const block: Block = {
        basefee: BigInt(t.block?.basefee ?? 0),
        coinbase: BigInt(t.block?.coinbase ?? 0),
        timestamp: BigInt(t.block?.timestamp ?? 0),
        number: BigInt(t.block?.number ?? 0),
        difficulty: BigInt(t.block?.difficulty ?? 0n),
        gaslimit: BigInt(t.block?.gaslimit ?? 0),
        chainid: BigInt(t.block?.chainid ?? 0),
      };
      worldState.accounts.clear();
      for (const [address, account] of Object.entries(t.state ?? {})) {
        worldState.accounts.set(BigInt(address), {
          balance: BigInt(account.balance ?? 0),
          code: hexToBytes(account.code?.bin ?? ""),
        });
      }
      const evm = new EVM(tx, prog, 32_000n, block);
      evm.writable = true;

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
      assertLogsEqual(t, evm.logs);
      assertReturnEqual(t, evm.returndata);
    });
  }
}

function assertReturnEqual(t: TestCase, returndata: Uint8Array) {
  assert.deepEqual(hexToBytes(t.expect.return ?? ""), returndata);
}

function assertLogsEqual(t: TestCase, logs: Log[]) {
  const expected = (t.expect.logs ?? []).map((l) => {
    return {
      address: BigInt(l.address),
      data: hexToBytes(l.data),
      topics: l.topics.map((l) => BigInt(l)),
    };
  });
  try {
    assert.deepEqual(expected, logs);
  } catch (e) {
    throw e;
  }
}

function assertStackEqual(t: TestCase, evm: EVM) {
  const expected = t.expect.stack ?? [];
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

function hexToBytes(hexString: string): Uint8Array {
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
