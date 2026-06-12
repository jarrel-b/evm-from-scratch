export class UnimplementedOpcodeError extends Error {
  constructor(readonly opcode: number) {
    super(`unimplemented opcode: 0x${opcode.toString(16)}`);
    this.name = "UnimplementedOpcodeError";
  }
}
