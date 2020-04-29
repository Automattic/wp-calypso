/**
 * Internal dependencies
 */
import 'state/data-layer/wpcom/sites/scan';

/**
 * Returns the current Jetpack Scan Progress for a given site only if the
 * Scan is in the 'scanning' state. If the Scan is in the 'scanning' state but
 * there is no progress in its state, we return 0.
 * Returns undefined in any other case.
 *
 * @param {object} state	Global state tree
 * @param {number} siteId	The ID of the site we're querying
 * @returns {?number}		Undefined or percentage of the scan completed
 */
export default function getSiteScanProgress( state, siteId ) {
	if ( state.jetpackScan.scan?.[ siteId ]?.state === 'scanning' ) {
		return state.jetpackScan.scan?.[ siteId ]?.mostRecent?.progress ?? 0;
	}
	return;
}
