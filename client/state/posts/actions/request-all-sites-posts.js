/**
 * Internal dependencies
 */
import { requestPosts } from 'calypso/state/posts/actions/request-posts';

import 'calypso/state/posts/init';

/**
 * Returns a function which, when invoked, triggers a network request to fetch
 * posts across all of the current user's sites for the specified query.
 *
 * @param  {string}   query Post query
 * @returns {Function}       Action thunk
 */
export function requestAllSitesPosts( query = {} ) {
	return requestPosts( null, query );
}
