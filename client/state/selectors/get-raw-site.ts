import getSitesItems from 'calypso/state/selectors/get-sites-items';
import type { SiteDetails } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

/**
 * Returns a raw site object by its ID.
 */
export default function getRawSite(
	state: AppState,
	siteId: string | number | null | undefined
): SiteDetails | null {
	if ( ! siteId ) {
		return null;
	}

	return getSitesItems( state )[ siteId ] || null;
}
