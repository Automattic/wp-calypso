import { select } from '@wordpress/data';
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

// Big Sky's wp.data store — read directly because the provider's
// `useCheckpoint` export has no record accessor.
const PROVIDER_STORE_NAME = 'ai-assembler';

type ProviderStoreSelect = {
	getCheckpoints?: () => { id?: string; checkpointKeys?: string[] }[] | undefined;
};

/**
 * The scoped keys of a provider-held checkpoint, or `null` when the record is
 * unreadable or keyless — Big Sky writes keyless checkpoints for some entity
 * edits, and those restore via its legacy full-snapshot path.
 */
export function getProviderCheckpointKeys( id: string ): string[] | null {
	const checkpoints =
		( select( PROVIDER_STORE_NAME ) as ProviderStoreSelect | undefined )?.getCheckpoints?.() ?? [];
	const checkpoint = checkpoints.find( ( record ) => record?.id === id );
	return Array.isArray( checkpoint?.checkpointKeys ) && checkpoint.checkpointKeys.length
		? checkpoint.checkpointKeys
		: null;
}
