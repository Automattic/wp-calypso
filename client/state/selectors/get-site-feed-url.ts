import 'calypso/state/data-layer/wpcom/sites/scan';
import getSiteUrl from './get-site-url';
import type { AppState } from 'calypso/types';

/**
 * Returns the current Jetpack Scan request status for a given site.
 * Returns undefined if the site is unknown, or if no information is available.
 */
export default function getSiteFeedUrl( state: AppState, siteId: number ): string | null {
	const siteUrl = getSiteUrl( state, siteId );
	if ( ! siteUrl ) {
		return null;
	}
	return `${ siteUrl }/feed`;
}
