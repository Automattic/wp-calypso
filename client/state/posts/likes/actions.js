/** @format */

/**
 * Internal dependencies
 */

import wpcom from 'lib/wp';
import {
	POST_LIKES_RECEIVE,
	POST_LIKES_REQUEST,
	POST_LIKES_REQUEST_SUCCESS,
	POST_LIKES_REQUEST_FAILURE,
	POST_LIKE,
	POST_LIKE_UPDATE_COUNT,
	POST_UNLIKE,
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
	return dispatch => {
		dispatch( {
			type: POST_LIKES_REQUEST,
			siteId,
			postId,
		} );

		return wpcom
			.site( siteId )
			.post( postId )
			.likesList()
			.then( ( { likes, i_like: iLike, found } ) => {
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
			} )
			.catch( error => {
				dispatch( {
					type: POST_LIKES_REQUEST_FAILURE,
					siteId,
					postId,
					error,
				} );
			} );
	};
}

/**
 * Create a like action for a given site and post
 *
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @returns {Object} The like action
 */
export const like = ( siteId, postId ) => ( {
	type: POST_LIKE,
	siteId,
	postId,
} );

/**
 * Create an unlike action for a given site and post
 *
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @returns {Object} The unlike action
 */
export const unlike = ( siteId, postId ) => ( {
	type: POST_UNLIKE,
	siteId,
	postId,
} );

export const receiveLikes = ( siteId, postId, { likes, iLike, found } ) => ( {
	type: POST_LIKES_RECEIVE,
	siteId,
	postId,
	likes,
	iLike,
	found,
} );

export const updateLikeCount = ( siteId, postId, likeCount ) => ( {
	type: POST_LIKE_UPDATE_COUNT,
	siteId,
	postId,
	likeCount,
} );
