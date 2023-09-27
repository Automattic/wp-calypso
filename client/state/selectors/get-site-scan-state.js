import 'calypso/state/data-layer/wpcom/sites/scan';

/**
 * Returns the current Jetpack Scan state for a given site.
 * Returns undefined if the site is unknown, or if no information is available.
 * @param {import('calypso/types').AppState} state	Global state tree
 * @param {number} siteId	The ID of the site we're querying
 * @returns {undefined|import('calypso/my-sites/scan/types').Scan}		An object describing the current scan state
 */
export default function getSiteScanState( state, siteId ) {
	return state.jetpackScan.scan?.[ siteId ];
}
