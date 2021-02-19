/**
 * Internal dependencies
 */
import { COMMENTS_QUERY_UPDATE } from 'calypso/state/action-types';

import 'calypso/state/comments/init';

/**
 * Creates an action that updates the comments pagination for the given site and filters.
 *
 * @param {number} siteId Site identifier.
 * @param {Array<object>} comments List of comments.
 * @param {object} query Current filter parameters.
 * @param {string} [query.order] Query order ('ASC' or 'DESC').
 * @param {number} query.page Page to update.
 * @param {number} [query.postId] Post identifier.
 * @param {string} [query.search] Search query.
 * @param {string} query.status Comments status.
 * @returns {object} Action that updates the comments pagination.
 */
export const updateCommentsQuery = ( siteId, comments, query ) => ( {
	type: COMMENTS_QUERY_UPDATE,
	siteId,
	comments,
	query,
} );
