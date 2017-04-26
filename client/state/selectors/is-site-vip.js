/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';

/**
 * Returns true if the site is VIP
 *
 * If the site is missing returns null.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is VIP
 */
export default function isSiteVip( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site || typeof site.is_vip === 'undefined' ) {
		return null;
	}

	return site.is_vip;
}
