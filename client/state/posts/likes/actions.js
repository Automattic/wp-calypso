/**
 * Internal dependencies
 */
import {
	POST_LIKES_RECEIVE,
	POST_LIKES_REQUEST,
	POST_LIKE,
	POST_LIKES_ADD_LIKER,
	POST_LIKES_REMOVE_LIKER,
	POST_UNLIKE,
} from 'state/action-types';

import 'state/data-layer/wpcom/sites/posts/likes';

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve post likes for a post.
 *
 * @param  {Number}   siteId Site ID
 * @param  {Number}   postId Post ID
 * @return {Object}        Action
 */
export function requestPostLikes( siteId, postId ) {
	return {
		type: POST_LIKES_REQUEST,
		siteId,
		postId,
	};
}

/**
 * Create a like action for a given site and post
 *
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @returns {Object} The like action
 */
export const like = ( siteId, postId, { source } = {} ) => ( {
	type: POST_LIKE,
	siteId,
	postId,
	source,
} );

/**
 * Create an unlike action for a given site and post
 *
 * @param {Number} siteId Site ID
 * @param {Number} postId Post ID
 * @returns {Object} The unlike action
 */
export const unlike = ( siteId, postId, { source } = {} ) => ( {
	type: POST_UNLIKE,
	siteId,
	postId,
	source,
} );

export const receiveLikes = ( siteId, postId, { likes, iLike, found } ) => ( {
	type: POST_LIKES_RECEIVE,
	siteId,
	postId,
	likes,
	iLike,
	found,
} );

export const addLiker = ( siteId, postId, likeCount, liker ) => ( {
	type: POST_LIKES_ADD_LIKER,
	siteId,
	postId,
	likeCount,
	liker,
} );

export const removeLiker = ( siteId, postId, likeCount, liker ) => ( {
	type: POST_LIKES_REMOVE_LIKER,
	siteId,
	postId,
	likeCount,
	liker,
} );
