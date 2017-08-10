/** @format */
/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';

/**
 * Returns true if the site is VIP
 *
 * If the site is missing returns null.
 *
 * @param  {Object}   state  Global state tree
 * @param  {Number}   siteId Site ID
 * @return {?Boolean}        Whether site is VIP
 */
export default function isVipSite( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site || ! site.hasOwnProperty( 'is_vip' ) ) {
		return null;
	}

	return site.is_vip;
}
