/**
 * Internal dependencies
 */
import { getRawSite } from 'state/sites/selectors';

/**
 * Returns true if the site is private
 *
 * @param {Object} state Global state tree
 * @param {Object} siteId Site ID
 * @return {Boolean} True if site is private
 */
export default function isPrivateSite( state, siteId ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	return site.is_private;
}
