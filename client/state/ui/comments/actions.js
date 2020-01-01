/**
 * Internal dependencies
 */
import { COMMENTS_QUERY_UPDATE } from 'state/action-types';

/**
 * Creates an action that updates the comments pagination for the given site and filters.
 *
 * @param {Number} siteId Site identifier.
 * @param {Array<Object>} comments List of comments.
 * @param {object} query Current filter parameters.
 * @param {String} [query.order] Query order ('ASC' or 'DESC').
 * @param {Number} query.page Page to update.
 * @param {Number} [query.postId] Post identifier.
 * @param {String} [query.search] Search query.
 * @param {String} query.status Comments status.
 * @returns {object} Action that updates the comments pagination.
 */
export const updateCommentsQuery = ( siteId, comments, query ) => ( {
	type: COMMENTS_QUERY_UPDATE,
	siteId,
	comments,
	query,
} );
