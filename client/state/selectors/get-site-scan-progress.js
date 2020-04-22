/**
 * Internal dependencies
 */
import 'state/data-layer/wpcom/sites/scan';

/**
 * Returns the current Jetpack Progress for a given site.
 * Returns undefined if the site is unknown, or if no information is available.
 *
 * @param {object} state	Global state tree
 * @param {number} siteId	The ID of the site we're querying
 * @returns {?number}		Undefined or percentage of the scan completed
 */
export default function getSiteScanProgress( state, siteId ) {
	return state.jetpackScan.scan?.[ siteId ]?.mostRecent?.progress;
}
