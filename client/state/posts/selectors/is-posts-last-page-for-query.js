/**
 * Internal dependencies
 */
import { DEFAULT_POST_QUERY } from 'calypso/state/posts/constants';
import { getPostsLastPageForQuery } from 'calypso/state/posts/selectors/get-posts-last-page-for-query';

import 'calypso/state/posts/init';

/**
 * Returns true if the query has reached the last page of queryable pages, or
 * null if the total number of queryable posts if unknown.
 *
 * @param   {object}   state  Global state tree
 * @param   {?number}  siteId Site ID, or `null` for all-sites queries
 * @param   {object}   query  Post query object
 * @returns {?boolean}        Whether last posts page has been reached
 */
export function isPostsLastPageForQuery( state, siteId, query = {} ) {
	const lastPage = getPostsLastPageForQuery( state, siteId, query );
	if ( null === lastPage ) {
		return lastPage;
	}

	return lastPage === ( query.page || DEFAULT_POST_QUERY.page );
}
