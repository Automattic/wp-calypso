/**
 * Internal dependencies
 */
import { getSerializedPostsQuery } from 'calypso/state/posts/utils';

import 'calypso/state/posts/init';

/**
 * Returns true if currently requesting posts for the posts query, or false
 * otherwise.
 *
 * @param   {object}  state  Global state tree
 * @param   {?number} siteId Site ID, or `null` for all-sites queries
 * @param   {object}  query  Post query object
 * @returns {boolean}        Whether posts are being requested
 */
export function isRequestingPostsForQuery( state, siteId, query ) {
	const serializedQuery = getSerializedPostsQuery( query, siteId );
	return !! state.posts.queryRequests[ serializedQuery ];
}
