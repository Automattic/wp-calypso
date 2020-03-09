/**
 * Internal dependencies
 */
import canCurrentUserUseCustomerHome from 'state/sites/selectors/can-current-user-use-customer-home';
import getSiteSlug from 'state/sites/selectors/get-site-slug';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getStatsDefaultSitePage } from 'lib/route/path';

import 'state/sites/init';

/**
 * Determine the default section to show for the specified site.
 *
 * @param  {object}  state  Global state tree.
 * @param  {?number} siteId Site ID.
 * @returns {string}         Url of the site home.
 */
export default function getSiteHomeUrl( state: object, siteId?: number ): string {
	const selectedSiteId = siteId || getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, selectedSiteId );

	return canCurrentUserUseCustomerHome( state, selectedSiteId )
		? `/home/${ siteSlug }`
		: getStatsDefaultSitePage( siteSlug );
}
