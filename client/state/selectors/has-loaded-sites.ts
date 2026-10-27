import type { AppState } from 'calypso/types';

/**
 * Returns true if sites have been loaded in the state
 */
export default function hasLoadedSites( state: AppState ): boolean {
	return state.sites.items !== null;
}
