export type Account = {
  balance: bigint;
};

export class WorldState {
  accounts: Map<bigint, Account> = new Map();
}

export const worldState = new WorldState();
