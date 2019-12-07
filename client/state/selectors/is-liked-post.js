/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Whether or not the current user likes this post
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  postId Post ID
 * @return {Boolean} Is the post liked
 */
export default function isLikedPost( state, siteId, postId ) {
	return get( state.posts.likes.items, [ siteId, postId, 'iLike' ], false );
}
