import type { UseCheckpointReturn } from './load-external-providers';

// TODO (ability-migration): Delete this bridge once the last checkpoint-writing
// Big Sky ability migrates — every checkpoint then lives in AM's own store.
/**
 * Bridge to the provider's checkpoint store. While Big Sky still executes some
 * mutating tools, their checkpoints live in its store — `restore-checkpoint`
 * delegates ids AM does not hold here, so no undo is lost mid-migration. The
 * chat mount keeps the provider's `useCheckpoint` API registered; ability
 * callbacks are plain functions and cannot call the hook themselves.
 */

let providerCheckpoints: UseCheckpointReturn | undefined;

export function setProviderCheckpoints( checkpoints: UseCheckpointReturn | undefined ): void {
	providerCheckpoints = checkpoints;
}

export function getProviderCheckpoints(): UseCheckpointReturn | undefined {
	return providerCheckpoints;
}
