/**
 * Internal dependencies
 */
import 'calypso/state/comments/init';

/**
 * Gets comment items for post
 *
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @returns {Array} comment items
 */
export function getPostCommentItems( state, siteId, postId ) {
	return state.comments.items[ `${ siteId }-${ postId }` ];
}
