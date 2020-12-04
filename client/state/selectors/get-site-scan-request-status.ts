/**
 * Internal dependencies
 */
import 'calypso/state/data-layer/wpcom/sites/scan';

/**
 * Returns the current Jetpack Scan request status for a given site.
 * Returns undefined if the site is unknown, or if no information is available.
 *
 * @param {object} state	Global state tree
 * @param {number} siteId	The ID of the site we're querying
 * @returns {?object}		An object describing the current scan request status
 */
export default function getSiteScanRequestStatus( state, siteId ) {
	return state.jetpackScan.requestStatus?.[ siteId ];
}
