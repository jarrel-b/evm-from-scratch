const MAXIMUM_STACK_SIZE = 1024;

class Stack {
  #items: number[] = [];

  push(value: number): void {
    if (this.#items.length === MAXIMUM_STACK_SIZE) {
      throw new Error("stack overflow");
    }
    this.#items.push(value);
  }

  pop(): number {
    const value = this.#items.pop();
    if (value === undefined) {
      throw new Error("stack underflow");
    }
    return value;
  }

  items(): number[] {
    return [...this.#items];
  }
}

class Memory {
  #bytes = new Uint8Array();

  access(offset: number, size: number): Uint8Array {
    this.#expand(offset, size);
    return this.#bytes.slice(offset, offset + size);
  };

  load(offset: number): Uint8Array {
    return this.access(offset, 32);
  };

  store(offset: number, value: Uint8Array): number {
    const gasCost = this.#expand(offset, value.length);
    this.#bytes.set(value, offset);
    return gasCost
  };

  #expand(offset: number, size: number): number {
    const requiredBytes = offset + size;
    if (requiredBytes <= this.#bytes.length) {
      return 0;
    }

    const oldSize = this.#bytes.length;
    const newSize = Math.ceil(requiredBytes / 32) * 32;
    const newBytes = new Uint8Array(newSize);

    newBytes.set(this.#bytes);
    this.#bytes = newBytes;

    return this.#gasCost(requiredBytes) - this.#gasCost(oldSize);
  }

  #gasCost(size: number): number {
    const words = Math.ceil(size / 32);
    const cost = Math.floor((words ** 2) / 512) + 3 * words;
    return cost
  }
}

class Storage {
  #slots = new Map<bigint, bigint>();
  #accessed = new Set<bigint>();

  load(slot: bigint): [boolean, bigint] {
    const warm = this.#accessed.has(slot);
    this.#accessed.add(slot);
    const val = this.#slots.get(slot);
    return [warm, val ?? 0n];
  }

  store(slot: bigint, val: bigint): void {
    this.#accessed.add(slot);
    if (val === 0n) {
      this.#slots.delete(slot);
      return;
    }
    this.#slots.set(slot, val);
  }
}

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
