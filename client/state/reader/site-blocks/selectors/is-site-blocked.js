/**
 * Internal dependencies
 */
import 'calypso/state/reader/init';

/**
 * Returns true if a site is known to be blocked
 *
 *
 * @param {number}  siteId Site ID
 * @returns {boolean}        Whether specified site is blocked
 */

export default function isSiteBlocked( state, siteId ) {
	return !! state.reader.siteBlocks.items[ siteId ];
}
