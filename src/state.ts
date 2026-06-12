export type Account = {
  balance: bigint;
  code?: Uint8Array;
};

export class WorldState {
  accounts: Map<bigint, Account> = new Map();
}

export const worldState = new WorldState();
