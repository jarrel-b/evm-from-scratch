import type { State as EVM } from "./state.js";
import * as uint256 from "./uint256.js";
import { keccak_256 } from "@noble/hashes/sha3.js";

export enum OpCode {
  STOP = 0x00,
  ADD = 0x01,
  MUL = 0x02,
  SUB = 0x03,
  DIV = 0x04,
  SDIV = 0x05,
  MOD = 0x6,
  SMOD = 0x7,
  ADDMOD = 0x8,
  MULMOD = 0x9,
  EXP = 0xa,
  SIGNEXTEND = 0xb,
  LT = 0x10,
  GT = 0x11,
  SLT = 0x12,
  SGT = 0x13,
  EQ = 0x14,
  ISZERO = 0x15,
  AND = 0x16,
  OR = 0x17,
  XOR = 0x18,
  NOT = 0x19,
  BYTE = 0x1a,
  SHL = 0x1b,
  SHR = 0x1c,
  SAR = 0x1d,
  KECCAK256 = 0x20,
  ADDRESS = 0x30,
  BALANCE = 0x31,
  ORIGIN = 0x32,
  CALLER = 0x33,
  CALLVALUE = 0x34,
  CALLDATALOAD = 0x35,
  CALLDATASIZE = 0x36,
  CALLDATACOPY = 0x37,
  CODESIZE = 0x38,
  CODECOPY = 0x39,
  GASPRICE = 0x3a,
  EXTCODESIZE = 0x3b,
  EXTCODECOPY = 0x3c,
  RETURNDATASIZE = 0x3d,
  RETURNDATACOPY = 0x3e,
  EXTCODEHASH = 0x3f,
  BLOCKHASH = 0x40,
  COINBASE = 0x41,
  TIMESTAMP = 0x42,
  NUMBER = 0x43,
  PREVRANDAO = 0x44,
  GASLIMIT = 0x45,
  CHAINID = 0x46,
  SELFBALANCE = 0x47,
  BASEFEE = 0x48,
  POP = 0x50,
  MLOAD = 0x51,
  MSTORE = 0x52,
  MSTORE8 = 0x53,
  SLOAD = 0x54,
  SSTORE = 0x55,
  JUMP = 0x56,
  JUMPI = 0x57,
  PC = 0x58,
  MSIZE = 0x59,
  GAS = 0x5a,
  JUMPDEST = 0x5b,
  PUSH0 = 0x5f,
  PUSH1 = 0x60,
  PUSH2 = 0x61,
  PUSH3 = 0x62,
  PUSH4 = 0x63,
  PUSH5 = 0x64,
  PUSH6 = 0x65,
  PUSH7 = 0x66,
  PUSH8 = 0x67,
  PUSH9 = 0x68,
  PUSH10 = 0x69,
  PUSH11 = 0x6a,
  PUSH12 = 0x6b,
  PUSH13 = 0x6c,
  PUSH14 = 0x6d,
  PUSH15 = 0x6e,
  PUSH16 = 0x6f,
  PUSH17 = 0x70,
  PUSH18 = 0x71,
  PUSH19 = 0x72,
  PUSH20 = 0x73,
  PUSH21 = 0x74,
  PUSH22 = 0x75,
  PUSH23 = 0x76,
  PUSH24 = 0x77,
  PUSH25 = 0x78,
  PUSH26 = 0x79,
  PUSH27 = 0x7a,
  PUSH28 = 0x7b,
  PUSH29 = 0x7c,
  PUSH30 = 0x7d,
  PUSH31 = 0x7e,
  PUSH32 = 0x7f,
  DUP1 = 0x80,
  DUP2 = 0x81,
  DUP3 = 0x82,
  DUP4 = 0x83,
  DUP5 = 0x84,
  DUP6 = 0x85,
  DUP7 = 0x86,
  DUP8 = 0x87,
  DUP9 = 0x88,
  DUP10 = 0x89,
  DUP11 = 0x8a,
  DUP12 = 0x8b,
  DUP13 = 0x8c,
  DUP14 = 0x8d,
  DUP15 = 0x8e,
  DUP16 = 0x8f,
  SWAP1 = 0x90,
  SWAP2 = 0x91,
  SWAP3 = 0x92,
  SWAP4 = 0x93,
  SWAP5 = 0x94,
  SWAP6 = 0x95,
  SWAP7 = 0x96,
  SWAP8 = 0x97,
  SWAP9 = 0x98,
  SWAP10 = 0x99,
  SWAP11 = 0x9a,
  SWAP12 = 0x9b,
  SWAP13 = 0x9c,
  SWAP14 = 0x9d,
  SWAP15 = 0x9e,
  SWAP16 = 0x9f,
  LOG0 = 0xa0,
  LOG1 = 0xa1,
  LOG2 = 0xa2,
  LOG3 = 0xa3,
  LOG4 = 0xa4,
  CREATE = 0xf0,
  CALL = 0xf1,
  CALLCODE = 0xf2,
  RETURN = 0xf3,
  DELEGATECALL = 0xf4,
  CREATE2 = 0xf5,
  STATICCALL = 0xfa,
  REVERT = 0xfd,
  INVALID = 0xfe,
  SELFDESTRUCT = 0xff,
}

export const handlers: Partial<Record<OpCode, (evm: EVM) => void>> = {
  [OpCode.STOP]: stop,
  [OpCode.ADD]: add,
  [OpCode.MUL]: mul,
  [OpCode.SUB]: sub,
  [OpCode.DIV]: div,
  [OpCode.SDIV]: sdiv,
  [OpCode.MOD]: mod,
  [OpCode.SMOD]: smod,
  [OpCode.ADDMOD]: addmod,
  [OpCode.MULMOD]: mulmod,
  [OpCode.EXP]: exp,
  [OpCode.LT]: lt,
  [OpCode.GT]: gt,
  [OpCode.SLT]: slt,
  [OpCode.SGT]: sgt,
  [OpCode.EQ]: eq,
  [OpCode.ISZERO]: iszero,
  [OpCode.AND]: and,
  [OpCode.OR]: or,
  [OpCode.XOR]: xor,
  [OpCode.NOT]: not,
  [OpCode.BYTE]: byte,
  [OpCode.SHL]: shl,
  [OpCode.SHR]: shr,
  [OpCode.SAR]: sar,
  [OpCode.KECCAK256]: keccak256,
  [OpCode.ADDRESS]: address,
  [OpCode.BALANCE]: balance,
  [OpCode.ORIGIN]: origin,
  [OpCode.CALLER]: caller,
  [OpCode.CALLVALUE]: callvalue,
  [OpCode.CALLDATALOAD]: calldataload,
  [OpCode.CODESIZE]: codesize,
  [OpCode.SLOAD]: sload,
  [OpCode.SSTORE]: sstore,
  [OpCode.PUSH0]: push0,
  [OpCode.PUSH1]: push1,
  [OpCode.PUSH2]: push2,
  [OpCode.PUSH3]: push3,
  [OpCode.PUSH4]: push4,
  [OpCode.PUSH6]: push6,
  [OpCode.PUSH10]: push10,
  [OpCode.PUSH11]: push11,
  [OpCode.PUSH32]: push32,
  [OpCode.POP]: pop,
  [OpCode.SIGNEXTEND]: signextend,
  [OpCode.DUP1]: dup1,
  [OpCode.DUP3]: dup3,
  [OpCode.DUP5]: dup5,
  [OpCode.DUP8]: dup8,
  [OpCode.SWAP1]: swap1,
  [OpCode.SWAP3]: swap3,
  [OpCode.SWAP5]: swap5,
  [OpCode.SWAP7]: swap7,
  [OpCode.INVALID]: invalid,
  [OpCode.PC]: pc,
  [OpCode.GAS]: gas,
  [OpCode.JUMP]: jump,
  [OpCode.JUMPDEST]: jumpdest,
  [OpCode.JUMPI]: jumpi,
  [OpCode.MLOAD]: mload,
  [OpCode.MSTORE]: mstore,
  [OpCode.MSTORE8]: mstore8,
  [OpCode.MSIZE]: msize,
};

function stop(evm: EVM): void {
  evm.stopFlag = true;
}

function add(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(a + b);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function mul(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(a * b);
  evm.pc += 1;
  evm.decrementGas(5n);
}

function sub(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(a - b);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function div(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(b === 0n ? 0n : a / b);
  evm.pc += 1;
  evm.decrementGas(5n);
}

function sdiv(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(b === 0n ? 0n : uint256.toSigned(a) / uint256.toSigned(b));
  evm.pc += 1;
  evm.decrementGas(5n);
}

function mod(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(b === 0n ? 0n : a % b);
  evm.pc += 1;
  evm.decrementGas(5n);
}

function smod(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(b === 0n ? 0n : uint256.toSigned(a) % uint256.toSigned(b));
  evm.pc += 1;
  evm.decrementGas(5n);
}

function addmod(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  const N = evm.stack.pop();
  evm.stack.push((a + b) % N);
  evm.pc += 1;
  evm.decrementGas(8n);
}

function mulmod(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  const N = evm.stack.pop();
  evm.stack.push((a * b) % N);
  evm.pc += 1;
  evm.decrementGas(8n);
}

function exp(evm: EVM): void {
  const a = evm.stack.pop();
  const exponent = evm.stack.pop();
  evm.stack.push(a ** exponent);
  evm.pc += 1;
  evm.decrementGas(10n + 50n * uint256.byteSize(exponent));
}

function lt(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(a < b ? 1n : 0n);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function gt(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(a > b ? 1n : 0n);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function slt(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(uint256.toSigned(a) < uint256.toSigned(b) ? 1n : 0n);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function sgt(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(uint256.toSigned(a) > uint256.toSigned(b) ? 1n : 0n);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function eq(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(a === b ? 1n : 0n);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function iszero(evm: EVM): void {
  const a = evm.stack.pop();
  evm.stack.push(a === 0n ? 1n : 0n);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function and(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(a & b);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function or(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(a | b);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function xor(evm: EVM): void {
  const a = evm.stack.pop();
  const b = evm.stack.pop();
  evm.stack.push(a ^ b);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function not(evm: EVM): void {
  const a = evm.stack.pop();
  evm.stack.push(~a);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function byte(evm: EVM): void {
  const i = evm.stack.pop();
  const x = evm.stack.pop();
  evm.stack.push(i >= 32 ? 0n : (x >> (8n * (31n - i))) & 0xffn);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function shl(evm: EVM): void {
  const shift = evm.stack.pop();
  const value = evm.stack.pop();
  evm.stack.push(shift >= 256n ? 0n : value << shift);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function shr(evm: EVM): void {
  const shift = evm.stack.pop();
  const value = evm.stack.pop();
  evm.stack.push(value >> shift);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function sar(evm: EVM): void {
  const shift = evm.stack.pop();
  const value = evm.stack.pop();
  evm.stack.push(uint256.toSigned(value) >> shift);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function keccak256(evm: EVM): void {
  const offset = evm.stack.pop();
  const size = evm.stack.pop();
  const [data, expansionCost] = evm.memory.access(Number(offset), Number(size));
  evm.stack.push(uint256.arrayToUint256(keccak_256(data)));
  evm.pc += 1;
  evm.decrementGas(30n + BigInt(expansionCost));
}

function address(evm: EVM): void {
  evm.stack.push(evm.tx.to);
  evm.pc += 1;
  evm.decrementGas(2n);
}

function balance(evm: EVM): void {
  evm.stack.push(99999999999n);
  evm.pc += 1;
  // 100 if warm
  evm.decrementGas(2600n);
}

function origin(evm: EVM): void {
  evm.stack.push(evm.tx.origin);
  evm.pc += 1;
  evm.decrementGas(2n);
}

function caller(evm: EVM): void {
  evm.stack.push(evm.tx.from);
  evm.pc += 1;
  evm.decrementGas(2n);
}

function callvalue(evm: EVM): void {
  evm.stack.push(evm.tx.value);
  evm.pc += 1;
  evm.decrementGas(2n);
}

function calldataload(evm: EVM): void {
  const i = Number(evm.stack.pop());
  let data = 0n;
  for (let offset = 0; offset < 32; offset++) {
    const byte = evm.calldata?.[i + offset] ?? 0n;
    data = (data << 8n) | BigInt(byte);
  }
  evm.stack.push(data);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function codesize(evm: EVM): void {
  evm.stack.push(BigInt(evm.program.length));
  evm.pc += 1;
  evm.decrementGas(2n);
}

function sload(evm: EVM): void {
  const key = evm.stack.pop();
  const [warm, val] = evm.storage.load(key);
  evm.stack.push(val);
  evm.pc += 1;
  evm.decrementGas(warm ? 100n : 2100n);
}

function sstore(evm: EVM): void {
  const key = evm.stack.pop();
  const val = evm.stack.pop();
  const cost = evm.storage.store(key, val);
  evm.pc += 1;
  evm.decrementGas(BigInt(cost));
}

function push0(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(2n);
  evm.stack.push(0n);
}

function push1(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(3n);
  _push(evm, 1);
}

function push2(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(3n);
  _push(evm, 2);
}

function push3(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(3n);
  _push(evm, 3);
}

function push4(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(3n);
  _push(evm, 4);
}

function push6(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(3n);
  _push(evm, 6);
}

function push10(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(3n);
  _push(evm, 10);
}

function push11(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(3n);
  _push(evm, 11);
}

function push32(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(3n);
  _push(evm, 32);
}

function _push(evm: EVM, n: number): void {
  let value = 0n;
  for (let i = 0; i < n; i++) {
    value = (value << 8n) | BigInt(evm.peek());
    evm.pc += 1;
  }
  evm.stack.push(value);
}

function pop(evm: EVM): void {
  evm.stack.pop();
  evm.pc += 1;
  evm.decrementGas(2n);
}

function signextend(evm: EVM): void {
  const b = evm.stack.pop();
  const x = evm.stack.pop();

  if (b >= 32) {
    evm.stack.push(x & uint256.UINT256_MASK);
  } else {
    const signBitIdx = 8n * b + 7n;
    const signBit = 1n << signBitIdx;
    const mask = (1n << (signBitIdx + 1n)) - 1n;
    if ((x & signBit) !== 0n) {
      evm.stack.push((x | ~mask) & uint256.UINT256_MASK);
    } else {
      evm.stack.push(x & mask);
    }
  }

  evm.pc += 1;
  evm.decrementGas(5n);
}

function dup1(evm: EVM): void {
  _dup(evm, 0);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function dup3(evm: EVM): void {
  _dup(evm, 2);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function dup5(evm: EVM): void {
  _dup(evm, 4);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function dup8(evm: EVM): void {
  _dup(evm, 7);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function _dup(evm: EVM, n: number): void {
  const idx = evm.stack.items.length - 1 - n;
  if (idx < 0 || idx >= evm.stack.items.length) {
    throw new Error("stack underflow");
  }
  evm.stack.push(evm.stack.items[idx]);
}

function swap1(evm: EVM): void {
  _swap(evm, 1);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function swap3(evm: EVM): void {
  _swap(evm, 3);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function swap5(evm: EVM): void {
  _swap(evm, 5);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function swap7(evm: EVM): void {
  _swap(evm, 7);
  evm.pc += 1;
  evm.decrementGas(3n);
}

function _swap(evm: EVM, n: number): void {
  const idxA = evm.stack.items.length - 1;
  if (idxA < 0) {
    throw new Error("stack underflow");
  }

  const idxB = idxA - n;
  if (idxB < 0) {
    throw new Error("stack underflow");
  }

  const a = evm.stack.items[idxA];
  const b = evm.stack.items[idxB];
  evm.stack.items[idxA] = b;
  evm.stack.items[idxB] = a;
}

function invalid(evm: EVM): void {
  evm.revertFlag = true;
}

function pc(evm: EVM): void {
  const counter = evm.pc;
  evm.stack.push(BigInt(counter));
  evm.pc += 1;
  evm.decrementGas(2n);
}

function gas(evm: EVM): void {
  // Return MAX_UINT256
  evm.stack.push((1n << 256n) - 1n);
  evm.pc += 1;
  evm.decrementGas(2n);
}

function jump(evm: EVM): void {
  const counter = Number(evm.stack.pop());

  if (!_isValidJumpDest(evm.program, counter)) {
    throw new Error(`invalid jump destination`);
  }

  evm.pc = counter;
  evm.decrementGas(8n);
}

function jumpi(evm: EVM): void {
  const counter = Number(evm.stack.pop());
  const b = evm.stack.pop();

  if (b === 0n) {
    evm.pc += 1;
    evm.decrementGas(10n);
    return;
  }

  if (!_isValidJumpDest(evm.program, counter)) {
    throw new Error(`invalid jump destination`);
  }

  evm.pc = Number(counter);
  evm.decrementGas(10n);
}

function _isValidJumpDest(program: Uint8Array, dest: number): boolean {
  if (dest < 0 || dest >= program.length) {
    return false;
  }

  for (let pc = 0; pc < program.length; ) {
    const op = program[pc];

    if (pc === dest) {
      return op === OpCode.JUMPDEST;
    }

    if (op >= OpCode.PUSH1 && op <= OpCode.PUSH32) {
      pc += 1 + (op - OpCode.PUSH1 + 1);
    } else {
      pc += 1;
    }
  }

  return false;
}

function jumpdest(evm: EVM): void {
  evm.pc += 1;
  evm.decrementGas(1n);
}

function mload(evm: EVM): void {
  const offset = evm.stack.pop();
  const [value, expansionCost] = evm.memory.load(Number(offset));
  evm.stack.push(uint256.arrayToUint256(value));
  evm.pc += 1;
  evm.decrementGas(3n + BigInt(expansionCost));
}

function mstore(evm: EVM): void {
  const offset = evm.stack.pop();
  const value = evm.stack.pop();
  const expansionCost = evm.memory.store(
    Number(offset),
    uint256.bigintToUint8Array(value),
  );
  evm.pc += 1;
  evm.decrementGas(3n + BigInt(expansionCost));
}

function mstore8(evm: EVM): void {
  const offset = evm.stack.pop();
  const value = evm.stack.pop();
  const expansionCost = evm.memory.store(Number(offset), uint256.toByte(value));
  evm.pc += 1;
  evm.decrementGas(3n + BigInt(expansionCost));
}

function msize(evm: EVM): void {
  evm.stack.push(BigInt(evm.memory.bytes.length));
  evm.pc += 1;
  evm.decrementGas(2n);
}
