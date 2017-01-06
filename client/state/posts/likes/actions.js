/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	POST_LIKES_RECEIVE,
	POST_LIKES_REQUEST,
	POST_LIKES_REQUEST_SUCCESS,
	POST_LIKES_REQUEST_FAILURE
} from 'state/action-types';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve post likes for a post.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   postId Post ID
 * @return {Function}        Action thunk
 */
export function requestPostLikes( siteId, postId ) {
	return ( dispatch ) => {
		dispatch( {
			type: POST_LIKES_REQUEST,
			siteId,
			postId,
		} );

		return wpcom.site( siteId ).post( postId ).likesList().then( ( { likes, i_like: iLike, found } ) => {
			dispatch( {
				type: POST_LIKES_RECEIVE,
				siteId,
				postId,
				likes,
				iLike,
				found,
			} );

			dispatch( {
				type: POST_LIKES_REQUEST_SUCCESS,
				siteId,
				postId,
			} );
		} ).catch( ( error ) => {
			dispatch( {
				type: POST_LIKES_REQUEST_FAILURE,
				siteId,
				postId,
				error
			} );
		} );
	};
}
