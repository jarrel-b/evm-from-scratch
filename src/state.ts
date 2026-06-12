import { toUint256 } from "./uint256.js";
import { OpCode, handlers } from "./ops.js";
import { UnimplementedOpcodeError } from "./errors.js";

const MAXIMUM_STACK_SIZE = 1024;

export class Stack {
  items: bigint[] = [];

  push(value: bigint): void {
    if (this.items.length === MAXIMUM_STACK_SIZE) {
      throw new Error("stack overflow");
    }
    this.items.push(toUint256(value));
  }

  pop(): bigint {
    const value = this.items.pop();
    if (value === undefined) {
      throw new Error("stack underflow");
    }
    return value;
  }

  toArray(): bigint[] {
    return [...this.items];
  }
}

export class Memory {
  bytes = new Uint8Array();

  access(offset: number, size: number): [Uint8Array, number] {
    const cost = this.#expand(offset, size);
    return [this.bytes.slice(offset, offset + size), cost];
  }

  load(offset: number): [Uint8Array, number] {
    return this.access(offset, 32);
  }

  store(offset: number, value: Uint8Array): number {
    const gasCost = this.#expand(offset, value.length);
    this.bytes.set(value, offset);
    return gasCost;
  }

  #expand(offset: number, size: number): number {
    const requiredBytes = offset + size;
    if (requiredBytes <= this.bytes.length) {
      return 0;
    }

    const oldSize = this.bytes.length;
    const newSize = Math.ceil(requiredBytes / 32) * 32;
    const newBytes = new Uint8Array(newSize);

    newBytes.set(this.bytes);
    this.bytes = newBytes;

    return this.#gasCost(requiredBytes) - this.#gasCost(oldSize);
  }

  #gasCost(size: number): number {
    const words = Math.ceil(size / 32);
    const cost = Math.floor(words ** 2 / 512) + 3 * words;
    return cost;
  }
}

export class Storage {
  #slots = new Map<bigint, bigint>();
  #accessed = new Set<bigint>();
  #originalValues = new Map<bigint, bigint>();

  load(slot: bigint): [boolean, bigint] {
    const warm = this.#accessed.has(slot);
    this.#accessed.add(slot);
    const val = this.#slots.get(slot);
    return [warm, val ?? 0n];
  }

  store(slot: bigint, val: bigint): number {
    if (!this.#originalValues.get(slot)) {
      this.#originalValues.set(slot, this.#slots.get(val) ?? 0n);
    }

    const warm = this.#accessed.has(slot);
    this.#accessed.add(slot);

    const staticGas = 0;
    const currentVal = this.#slots.get(slot);
    const originalVal = this.#originalValues.get(slot) ?? 0n;

    let baseDynamicGas = 0;
    if (val === currentVal) {
      baseDynamicGas = 100;
    } else if (currentVal === originalVal) {
      baseDynamicGas = originalVal === 0n ? 20000 : 2900;
    } else {
      baseDynamicGas = 100;
    }

    baseDynamicGas += warm ? 0 : 2100;

    if (val === 0n) {
      this.#slots.delete(slot);
    } else {
      this.#slots.set(slot, val);
    }

    return staticGas + baseDynamicGas;
  }
}

export type Tx = {
  origin: bigint;
  from: bigint;
  to: bigint;
  value: bigint;
  calldata?: Uint8Array;
};

export class State {
  pc = 0;
  stack = new Stack();
  memory = new Memory();
  storage = new Storage();

  #gas: bigint;
  tx: Tx;
  program: Readonly<Uint8Array>;
  calldata?: Readonly<Uint8Array>;

  stopFlag = false;
  revertFlag = false;

  #returndata = [];
  #logs = [];

  constructor(tx: Tx, program: Uint8Array, gas: bigint) {
    this.tx = tx;
    this.program = program;
    this.#gas = gas;
  }

  decrementGas(amount: bigint): void {
    if (this.#gas - amount < 0) {
      throw new Error("out of gas");
    }
  }

  shouldExecute(): boolean {
    if (this.pc >= this.program.length) {
      return false;
    }
    if (this.stopFlag) {
      return false;
    }
    if (this.revertFlag) {
      return false;
    }
    return true;
  }

  peek(): number {
    return this.program[this.pc];
  }

  run(maxSteps = 10_000): void {
    let steps = 0;
    while (this.shouldExecute()) {
      if (steps++ >= maxSteps) {
        throw new Error(`execution step limit exceeded`);
      }

      const op = this.program[this.pc] as OpCode;
      const handler = handlers[op];
      if (handler === undefined) {
        throw new UnimplementedOpcodeError(op);
      }
      handler(this);
    }
  }

  reset(): void {
    this.pc = 0;
    this.stack = new Stack();
    this.memory = new Memory();
    this.storage = new Storage();
  }
}
