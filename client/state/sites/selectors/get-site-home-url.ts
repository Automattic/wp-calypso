import { getStatsDefaultSitePage } from 'calypso/lib/route/path';
import { canCurrentUserUseCustomerHome, getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

/**
 * Determine the default section to show for the specified site.
 *
 * @param  {Object}  state  Global state tree.
 * @param  {?number} siteId Site ID.
 * @returns {string}         Url of the site home.
 */
export default function getSiteHomeUrl( state: AppState, siteId?: number ): string {
	const selectedSiteId = siteId || getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, selectedSiteId );

	return canCurrentUserUseCustomerHome( state, selectedSiteId )
		? `/home/${ siteSlug }`
		: getStatsDefaultSitePage( siteSlug ?? undefined );
}
