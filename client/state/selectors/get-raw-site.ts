import getSitesItems from 'calypso/state/selectors/get-sites-items';
import type { SiteDetails } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

/**
 * Returns a raw site object by its ID.
 */
export default function getRawSite( state: AppState, siteId: number | string ): SiteDetails | null {
	return typeof siteId === 'number' ? getSitesItems( state )[ siteId ] || null : null;
}
