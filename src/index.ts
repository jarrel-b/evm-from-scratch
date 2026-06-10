import { Stack, Memory, Storage } from "./state.js";

async function main() {
  const stack = new Stack();
  stack.push(2);
  stack.push(4);
  stack.push(1);
  console.log("stack", stack.items());

  const memory = new Memory();
  const cost = memory.store(0, new Uint8Array([0x01, 0x02, 0x03, 0x04]));
  console.log("cost", cost);
  console.log("memory", memory.load(0));

  const storage = new Storage();
  storage.store(1n, 420n);
  console.log(storage.load(1n));
  console.log(storage.load(1n));
  console.log(storage.load(1337n));
}

main().catch(console.error);
