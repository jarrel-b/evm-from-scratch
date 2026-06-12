import { EVM, type Block, type Tx } from "./evm.js";
import { OpCode } from "./ops.js";

async function main() {
  const prog = new Uint8Array([
    OpCode.PUSH1,
    0x1,
    OpCode.PUSH1,
    0x02,
    OpCode.ADD,
  ]);
  const tx: Tx = {
    origin: 0x1337n,
    from: 0x1337n,
    to: 0xaaan,
    value: 0n,
    gasprice: 0n,
  };
  const block: Block = {
    basefee: 0n,
    coinbase: 0n,
    timestamp: 0n,
    number: 0n,
    difficulty: 0n,
    gaslimit: 0n,
    chainid: 0n,
  };
  const evm = new EVM(tx, prog, 21_000n, block);
  evm.run();
  console.log(evm.stack.toArray());
}

main().catch(console.error);
