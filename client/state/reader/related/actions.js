/**
 * External Dependencies
 */

/**
 * Internal Dependencies
 */
import {
	READER_RELATED_POSTS_REQUEST,
	READER_RELATED_POSTS_REQUEST_SUCCESS,
	READER_RELATED_POSTS_REQUEST_FAILURE,
	READER_RELATED_POSTS_RECEIVE
} from 'state/action-types';
import wpcom from 'lib/wp';

export function requestRelatedPosts( siteId, postId ) {
	return function( dispatch ) {
		dispatch( {
			type: READER_RELATED_POSTS_REQUEST
		} );

		wpcom.undocumented().readRelatedPosts( siteId, postId ).then(
			( response ) => {
				dispatch( {
					type: READER_RELATED_POSTS_REQUEST_SUCCESS,
					payload: { siteId, postId }
				} );
				// collect posts and dispatch
				dispatch( {
					type: READER_RELATED_POSTS_RECEIVE,
					payload: {
						siteId,
						postId,
						posts: response && response.posts
					}
				} );
			},
			( err ) => {
				dispatch( {
					type: READER_RELATED_POSTS_REQUEST_FAILURE,
					payload: { siteId, postId, error: err },
					error: true
				} );
			}
		);
	};
}
