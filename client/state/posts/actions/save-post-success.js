/**
 * Internal dependencies
 */
import { POST_SAVE_SUCCESS } from 'calypso/state/action-types';

import 'calypso/state/posts/init';

/**
 * Returns an action object to be used in signalling that a post has been saved
 *
 * @param  {number}   siteId     Site ID
 * @param  {number}   postId     Post ID
 * @param  {object}   savedPost  Updated post
 * @param  {object}   post       Post attributes
 * @returns {object}              Action thunk
 */
export function savePostSuccess( siteId, postId = null, savedPost, post ) {
	return {
		type: POST_SAVE_SUCCESS,
		siteId,
		postId,
		savedPost,
		post,
	};
}
