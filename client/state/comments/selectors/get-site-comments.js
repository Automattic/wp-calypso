/**
 * External dependencies
 */
import { filter, orderBy } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

import 'state/comments/init';

function filterCommentsByStatus( comments, status ) {
	return 'all' === status
		? filter(
				comments,
				( comment ) => 'approved' === comment.status || 'unapproved' === comment.status
		  )
		: filter( comments, ( comment ) => status === comment.status );
}

/**
 * Returns list of loaded comments for a given site, filtered by status
 *
 * @param {object} state Redux state
 * @param {number} siteId Site for whose comments to find
 * @param {string} [status] Status to filter comments
 * @param {string} [order=asc] Order in which to sort filtered comments
 * @returns {Array<object>} Available comments for site, filtered by status
 */
export const getSiteComments = createSelector(
	( state, siteId, status, order = 'asc' ) => {
		const comments = state.comments.items ?? {};
		const parsedComments = Object.keys( comments )
			.filter( ( key ) => parseInt( key.split( '-', 1 ), 10 ) === siteId )
			.reduce( ( list, key ) => [ ...list, ...comments[ key ] ], [] );

		return status
			? orderBy( filterCommentsByStatus( parsedComments, status ), 'date', order )
			: orderBy( parsedComments, 'date', order );
	},
	( state ) => [ state.comments.items ]
);
