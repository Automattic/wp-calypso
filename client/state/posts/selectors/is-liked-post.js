/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/posts/init';

/**
 * Whether or not the current user likes this post
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post ID
 * @returns {boolean} Is the post liked
 */
export function isLikedPost( state, siteId, postId ) {
	return get( state.posts.likes.items, [ siteId, postId, 'iLike' ], false );
}
