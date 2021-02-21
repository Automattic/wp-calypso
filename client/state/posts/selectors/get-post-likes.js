/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import 'calypso/state/posts/init';

/**
 * Returns the post likes for a given site ID, post ID.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post ID
 * @returns {Array}          Post Likes
 */
export function getPostLikes( state, siteId, postId ) {
	return get( state.posts.likes.items, [ siteId, postId, 'likes' ], null );
}
