/**
 * External dependencies
 */
import { filter, get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns a tree of loaded comments for a given site, filtered by status
 *
 * @param {object} state Redux state
 * @param {number} siteId Site for whose comments to find
 * @param {string} [status] Status to filter comments
 * @returns {Array<object>} Comments tree for site, filtered by status
 */
export const getSiteCommentsTree = createSelector(
	( state, siteId, status ) => {
		const siteTree = get( state, [ 'comments', 'trees', siteId ] );
		if ( ! status ) {
			return siteTree;
		}

		return 'all' === status
			? filter(
					siteTree,
					comment => 'approved' === comment.status || 'unapproved' === comment.status
			  )
			: filter( siteTree, { status } );
	},
	( state, siteId ) => [ get( state, [ 'comments', 'trees', siteId ] ) ]
);

export default getSiteCommentsTree;
