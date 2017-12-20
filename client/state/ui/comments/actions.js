/** @format */
/**
 * Internal dependencies
 */
import { COMMENTS_QUERY_UPDATE } from 'state/action-types';

export const updateCommentsQuery = ( siteId, comments, query ) => ( {
	type: COMMENTS_QUERY_UPDATE,
	siteId,
	comments,
	query,
} );
