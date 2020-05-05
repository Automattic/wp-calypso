/**
 * Internal dependencies
 */
import 'state/data-layer/wpcom/sites/scan';

/**
 * Returns true if the most recent Scan is the first Scan run and false otherwise.
 *
 * @param {object} state	Global state tree
 * @param {number} siteId	The ID of the site we're querying
 * @returns {boolean}		If the most recent Scan was the first one
 */
export default function getSiteScanIsInitial( state, siteId ) {
	return state.jetpackScan.scan?.[ siteId ]?.mostRecent?.isInitial ?? false;
}
