import { State as EVM } from "./state.js";
import { OpCode } from "./ops.js";

async function main() {
  const prog = new Uint8Array([
    OpCode.PUSH1,
    0x1,
    OpCode.PUSH1,
    0x02,
    OpCode.ADD,
  ]);
  const evm = new EVM(BigInt(0x1337), prog, 21_000n, 0n);
  evm.run();
  console.log(evm.stack.items());
}

main().catch(console.error);
