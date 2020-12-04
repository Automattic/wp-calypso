/**
 * Internal dependencies
 */
import 'calypso/state/comments/init';

/**
 * Get total number of comments on the server for a given post
 *
 * @param {object} state redux state
 * @param {number} siteId site identification
 * @param {number} postId site identification
 * @returns {number} total comments count on the server. if not found, assume infinity
 */
export function getPostTotalCommentsCount( state, siteId, postId ) {
	return state.comments.totalCommentsCount[ `${ siteId }-${ postId }` ];
}
