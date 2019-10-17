/**
 * Internal dependencies
 */
import { canCurrentUserUseCustomerHome, getSiteSlug } from 'state/sites/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import { getStatsDefaultPage, getStatsDefaultSitePage } from 'lib/route/path';
import { untrailingslashit } from 'lib/route';

const customerHomeSlug = '/home/';

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
		? customerHomeSlug + siteSlug
		: getStatsDefaultSitePage( siteSlug );
}

/**
 * Determine the default section to show in my-sites
 *
 * @param  {Object}  state  Global state tree.
 * @param  {?Number} siteId Site ID.
 * @return {String}         Url of the site base.
 */
export function getBaseUrl( state: object, siteId?: number ): string {
	const selectedSiteId = siteId || getSelectedSiteId( state );
	const baseUrl = canCurrentUserUseCustomerHome( state, selectedSiteId )
		? customerHomeSlug
		: getStatsDefaultPage();

	return untrailingslashit( baseUrl );
}
