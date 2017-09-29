/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns the active reply comment for a given site and post.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  The ID of the site we're querying
 * @param  {Number}  postId  The ID of the post we're querying
 * @return {Number|String}	commentId 	Can be a string if the comment is a placeholder
 */
export default function getActiveReplyCommentId( state, siteId, postId ) {
	return get( state.comments.activeReplyComments, `${ siteId }-${ postId }`, null );
}
