/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the count of post likes for a given site ID, post ID.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  postId Post ID
 * @return {Array}          Post Likes
 */
export default function getPostLikeCount( state, siteId, postId ) {
	return get( state.posts.likes.items, [ siteId, postId, 'found' ], 0 );
}
