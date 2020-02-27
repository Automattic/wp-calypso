/**
 * Internal dependencies
 */
import { getQueryManager } from 'state/posts/selectors/get-query-manager';

import 'state/posts/init';

/**
 * Returns the total number of items reported to be found for the given query,
 * or null if the total number of queryable posts is unknown.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {?number}        Total number of found items
 */
export function getPostsFoundForQuery( state, siteId, query ) {
	const manager = getQueryManager( state, siteId );
	if ( ! manager ) {
		return null;
	}

	return manager.getFound( query );
}
