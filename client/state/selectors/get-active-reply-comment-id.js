/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getStateKey } from 'state/comments/utils';

/**
 * Returns the active reply comment for a given site and post.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  The ID of the site we're querying
 * @param  {number}  postId  The ID of the post we're querying
 * @returns {number|string}	commentId 	Can be a string if the comment is a placeholder
 */
export default function getActiveReplyCommentId( { state, siteId, postId } ) {
	return get( state.comments.activeReplies, getStateKey( siteId, postId ), null );
}
