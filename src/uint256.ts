export const UINT256_MODULUS = 2n ** 256n;

const SIGN_BIT = 2n ** 255n;

// JS's % can return a negative result (e.g. -1n % 256n === -1n).
// (x % M + M) % M guarantees the result is always in [0, M).
export function toUint256(value: bigint): bigint {
  return ((value % UINT256_MODULUS) + UINT256_MODULUS) % UINT256_MODULUS;
}

export function toSigned(value: bigint): bigint {
  return value >= SIGN_BIT ? value - UINT256_MODULUS : value;
}

export function byteSize(value: bigint): bigint {
  return value === 0n ? 0n : BigInt(Math.ceil(value.toString(16).length / 2));
}

export function arrayToUint256(bytes: Uint8Array): bigint {
  return bytes.reduce((acc, byte) => {
    return (acc << 8n) | BigInt(byte);
  }, 0n);
}
