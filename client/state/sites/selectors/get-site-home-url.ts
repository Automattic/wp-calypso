/**
 * Internal dependencies
 */
import { canCurrentUserUseCustomerHome, getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getStatsDefaultSitePage } from 'lib/route/path';

/**
 * Determine the default section to show for the specified site.
 *
 * @param  {Object}  state  Global state tree.
 * @param  {?Number} siteId Site ID.
 * @return {String}         Url of the site home.
 */
export default function getSiteHomeUrl( state: object, siteId?: number ): string {
	const selectedSiteId = siteId || getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, selectedSiteId );

	return canCurrentUserUseCustomerHome( state, selectedSiteId )
		? `/home/${ siteSlug }`
		: getStatsDefaultSitePage( siteSlug );
}
