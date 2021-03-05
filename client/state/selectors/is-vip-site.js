/**
 * Internal dependencies
 */

import getRawSite from 'calypso/state/selectors/get-raw-site';

/**
 * Returns true if the site is VIP
 *
 * If the site is missing returns null.
 *
 * @param  {object}   state  Global state tree
 * @param  {number}   siteId Site ID
 * @returns {?boolean}        Whether site is VIP
 */
export default function isVipSite( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site || ! site.hasOwnProperty( 'is_vip' ) ) {
		return null;
	}

	return site.is_vip;
}
