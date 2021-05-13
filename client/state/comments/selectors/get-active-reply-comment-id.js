/**
 * Internal dependencies
 */
import { getStateKey } from 'calypso/state/comments/utils';

import 'calypso/state/comments/init';

/**
 * Returns the active reply comment for a given site and post.
 *
 * @param  {object}  options options object.
 * @param  {object}  options.state   Global state tree
 * @param  {number}  options.siteId  The ID of the site we're querying
 * @param  {number}  options.postId  The ID of the post we're querying
 * @returns {number|string}	commentId 	Can be a string if the comment is a placeholder
 */
export function getActiveReplyCommentId( { state, siteId, postId } ) {
	return state.comments.activeReplies[ getStateKey( siteId, postId ) ] ?? null;
}
