/**
 * Internal dependencies
 */
import 'calypso/state/comments/init';

/**
 * Return comment counts for the given site and post ID, if applicable.
 *
 * @param {object} state Redux state
 * @param {number} siteId Site identifier
 * @param {number} [postId] Post identifier
 * @returns {object} The requested comment counts
 */
export function getSiteCommentCounts( state, siteId, postId ) {
	if ( postId ) {
		return state.comments.counts[ siteId ]?.[ postId ] ?? null;
	}
	return state.comments.counts[ siteId ]?.site ?? null;
}
