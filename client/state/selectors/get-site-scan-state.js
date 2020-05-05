/**
 * Internal dependencies
 */
import 'state/data-layer/wpcom/sites/scan';

/**
 * Returns the current Jetpack Scan state for a given site.
 * Returns undefined if the site is unknown, or if no information is available.
 *
 * @param {object} state	Global state tree
 * @param {number} siteId	The ID of the site we're querying
 * @returns {?object}		An object describing the current scan state
 */
export default function getSiteScanState( state, siteId ) {
	return state.jetpackScan.scan?.[ siteId ];
}
