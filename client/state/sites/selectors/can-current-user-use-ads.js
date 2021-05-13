/**
 * Internal dependencies
 */
import { canAccessWordads } from 'calypso/lib/ads/utils';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSite from './get-site';

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
