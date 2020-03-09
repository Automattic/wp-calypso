/**
 * Internal dependencies
 */
import { canAccessWordads } from 'lib/ads/utils';
import { getSelectedSiteId } from 'state/ui/selectors';
import getSite from 'state/sites/selectors/get-site';

import 'state/sites/init';

/**
 * Returns true if current user can see and use WordAds option in menu
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is previewable
 */
export default function canCurrentUserUseAds( state, siteId = null ) {
	if ( ! siteId ) {
		siteId = getSelectedSiteId( state );
	}
	const site = getSite( state, siteId );
	return site && !! canAccessWordads( site );
}
