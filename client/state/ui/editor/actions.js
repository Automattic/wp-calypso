/**
 * Internal dependencies
 */
import { EDITOR_POST_ID_SET } from 'state/action-types';

/**
 * Returns an action object to be used in signalling that the editor should
 * begin to edit the post with the specified post ID, or `null` as a new post.
 *
 * @param  {?Number} postId Post ID
 * @return {Object}         Action object
 */
export function setEditorPostId( postId ) {
	return {
		type: EDITOR_POST_ID_SET,
		postId
	};
}
