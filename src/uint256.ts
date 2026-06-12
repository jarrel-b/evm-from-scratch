export const UINT256_MODULUS = 1n << 256n;
const SIGN_BIT = 1n << 255n;
export const UINT256_MASK = (1n << 256n) - 1n;

// JS's % can return a negative result (e.g. -1n % 256n === -1n).
// (x % M + M) % M guarantees the result is always in [0, M).
export function toUint256(value: bigint): bigint {
  return value & UINT256_MASK;
}

export function toSigned(value: bigint): bigint {
  return (value & SIGN_BIT) !== 0n ? value - UINT256_MODULUS : value;
}

export function byteSize(value: bigint): bigint {
  return value === 0n ? 0n : BigInt(Math.ceil(value.toString(16).length / 2));
}

export function bytesToUint(bytes: Uint8Array): bigint {
  return bytes.reduce((acc, byte) => {
    return (acc << 8n) | BigInt(byte);
  }, 0n);
}

export function bigintToBytes(value: bigint): Uint8Array {
  value &= UINT256_MASK;
  const bytes = new Uint8Array(32);
  for (let i = 31; i >= 0; i--) {
    bytes[i] = Number(value & 0xffn);
    value >>= 8n;
  }
  return bytes;
}

export function toByte(value: bigint): Uint8Array {
  return new Uint8Array([Number(value & 0xffn)]);
}

export function toAddress(value: bigint): bigint {
  return value & ((1n << 160n) - 1n);
}
