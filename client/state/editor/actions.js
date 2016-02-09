/**
 * Internal dependencies
 */
import { EDITOR_POST_EDIT } from 'state/action-types';

/**
 * Returns an action object to be used in signalling that the specified
 * post updates should be applied to the set of edits.
 *
 * @param  {Object} post   Post attribute updates
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post ID
 * @return {Object}        Action object
 */
export function editPost( post, siteId, postId ) {
	return {
		type: EDITOR_POST_EDIT,
		post,
		siteId,
		postId
	};
}
