/**
 * External dependencies
 */
import { filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

function filterCommentsByStatus( comments, status ) {
	return 'all' === status
		? filter( comments, comment => ( 'approved' === comment.status || 'unapproved' === comment.status ) )
		: filter( comments, comment => ( status === comment.status ) );
}

/**
 * Returns list of loaded comments for a given site, filtered by status
 *
 * @param {Object} state Redux state
 * @param {Number} siteId Site for whose comments to find
 * @param {String} [status=unapproved] Status to filter comments
 * @returns {Array<Object>} Available comments for site, filtered by status
 */
export const getSiteComments = createSelector(
	( state, siteId, status = 'unapproved' ) => {
		const comments = get( state, 'comments.items', {} );
		const parsedComments = Object.keys( comments )
			.filter( key => parseInt( key.split( '-', 1 ), 10 ) === siteId )
			.reduce( ( list, key ) => [ ...list, ...comments[ key ] ], [] );

		return filterCommentsByStatus( parsedComments, status );
	},
	state => [ state.comments.items ]
);

export default getSiteComments;
