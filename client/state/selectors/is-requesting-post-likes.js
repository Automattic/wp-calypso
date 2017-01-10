/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if currently requesting post likes for the specified site ID, post ID or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Number}  postId Post ID
 * @return {Boolean}        Whether post likes are being requested
 */
export default function isRequestingPostLikes( state, siteId, postId ) {
	return get( state.posts.likes.requesting, [ siteId, postId ], false );
}
