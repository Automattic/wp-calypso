/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { POSTS_REQUEST_FAILURE, POSTS_REQUEST_SUCCESS, POSTS_REQUEST } from 'state/action-types';
import { receivePosts } from 'state/posts/actions/receive-posts';

import 'state/posts/init';

/**
 * Triggers a network request to fetch posts for the specified site and query.
 *
 * @param  {?number}  siteId Site ID
 * @param  {string}   query  Post query
 * @returns {Function}        Action thunk
 */
export function requestPosts( siteId, query = {} ) {
	return ( dispatch ) => {
		dispatch( {
			type: POSTS_REQUEST,
			siteId,
			query,
		} );

		const source = siteId ? wpcom.site( siteId ) : wpcom.me();

		return source
			.postsList( { ...query } )
			.then( ( { found, posts } ) => {
				dispatch( receivePosts( posts ) );
				dispatch( {
					type: POSTS_REQUEST_SUCCESS,
					siteId,
					query,
					found,
					posts,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: POSTS_REQUEST_FAILURE,
					siteId,
					query,
					error,
				} );
			} );
	};
}
