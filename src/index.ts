const MAXIMUM_STACK_SIZE = 1024;

class Stack {
  #items: number[] = [];

  public push(value: number): void {
    if (this.#items.length === MAXIMUM_STACK_SIZE) {
      throw new Error("stack overflow");
    }
    this.#items.push(value);
  }

  public pop(): number {
    const value = this.#items.pop();
    if (value === undefined) {
      throw new Error("stack underflow");
    }
    return value;
  }

  public items(): number[] {
    return [...this.#items];
  }
}

class Memory {
  #bytes = new Uint8Array();

  public access(offset: number, size: number): Uint8Array {
    this.#expand(offset, size);
    return this.#bytes.slice(offset, offset + size);
  };

  public load(offset: number): Uint8Array {
    return this.access(offset, 32);
  };

  public store(offset: number, value: Uint8Array): number {
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
}

main().catch(console.error);
