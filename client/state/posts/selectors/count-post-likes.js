import { get } from 'lodash';

import 'calypso/state/posts/init';

/**
 * Returns the total of post likes for a given site ID, post ID.
 *
 * @param   {Object}  state		Global state tree
 * @param   {number}  siteId	Site ID
 * @param   {number}  postId  	Post ID
 * @returns {number | null}		Post Likes count
 */
export function countPostLikes( state, siteId, postId ) {
	return get( state.posts.likes.items, [ siteId, postId, 'found' ], null );
}
