import getRawSite from 'calypso/state/selectors/get-raw-site';
import type { AppState } from 'calypso/types';

/**
 * Returns true if site is a A4A client site
 */
export default function isA4AClientSite(
	state: AppState,
	siteId: number | undefined | null
): boolean {
	if ( ! siteId ) {
		return false;
	}

	return !! getRawSite( state, siteId )?.is_a4a_client;
}
