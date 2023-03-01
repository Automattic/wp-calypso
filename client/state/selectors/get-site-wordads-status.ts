import type { AppState } from 'calypso/types';

/**
 * Returns the wordads status for a site
 */
export default function getSiteWordadsStatus(
	state: AppState,
	siteId: number | undefined | null
): string | null {
	if ( ! siteId ) {
		return null;
	}
	return state.wordads?.status?.[ siteId ]?.status ?? null;
}
