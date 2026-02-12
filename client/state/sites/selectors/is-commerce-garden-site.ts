import getRawSite from 'calypso/state/selectors/get-raw-site';
import { AppState } from 'calypso/types';

/**
 * Returns true if the site is a Commerce Garden site, false otherwise.
 * @param  {Object}   state  Global state tree
 * @param  {number | null}   siteId Site ID
 * @returns {boolean}        Whether site is a Commerce Garden site or not
 */
export default function isCommerceGardenSite( state: AppState, siteId: number | null ) {
	if ( ! siteId ) {
		return false;
	}
	const site = getRawSite( state, siteId );
	return site?.is_garden && site.garden_name === 'commerce';
}
