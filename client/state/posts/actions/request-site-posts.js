/**
 * Internal dependencies
 */
import { requestPosts } from 'calypso/state/posts/actions/request-posts';

import 'calypso/state/posts/init';

/**
 * Triggers a network request to fetch posts for the specified site and query.
 *
 * @param  {number}   siteId Site ID
 * @param  {string}   query  Post query
 * @returns {Function}        Action thunk
 */
export function requestSitePosts( siteId, query = {} ) {
	if ( ! siteId ) {
		return null;
	}

	return requestPosts( siteId, query );
}
