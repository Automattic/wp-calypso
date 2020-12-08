/**
 * Internal dependencies
 */

import MediaQueryManager from 'calypso/lib/query-manager/media';

/**
 * Returns true if media is being requested for a specified site ID and query.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {object}  query  Query object
 * @returns {bool}           True if media is being requested
 */
export default function isRequestingMedia( state, siteId, query ) {
	const queryRequests = state.media.queryRequests[ siteId ];

	if ( ! queryRequests ) {
		return false;
	}

	return queryRequests[ MediaQueryManager.QueryKey.stringify( query ) ] || false;
}
