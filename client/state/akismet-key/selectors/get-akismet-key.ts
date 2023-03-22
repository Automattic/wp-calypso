import type { AppState } from 'calypso/types';

/**
 * Get the Akismet key
 *
 * @param state
 * @returns null | string
 */
export default function getAkismetKey( state: AppState ) {
	return state.akismetKey?.key ?? null;
}
