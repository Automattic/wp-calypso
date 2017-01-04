/**
 * Internal dependencies
 */
import MediaQueryManager from 'lib/query-manager/media';

/**
 * Returns true if media is being requested for a specified site ID and query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Query object
 * @return {bool}           True if media is being requested
 */
export default function isRequestingMedia( state, siteId, query ) {
	const queryRequests = state.media.queryRequests[ siteId ];

	if ( ! queryRequests ) {
		return false;
	}

	return queryRequests[ MediaQueryManager.QueryKey.stringify( query ) ] || false;
}
