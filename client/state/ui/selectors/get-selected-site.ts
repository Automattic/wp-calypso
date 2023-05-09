import getSite from 'calypso/state/sites/selectors/get-site';
import getSelectedSiteId from './get-selected-site-id';
import type { SiteDetails } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

/**
 * Returns the site object for the currently selected site.
 */
export default function getSelectedSite( state: AppState ): SiteDetails | null | undefined {
	const siteId = getSelectedSiteId( state );
	if ( ! siteId ) {
		return null;
	}
	return getSite( state, siteId );
}
