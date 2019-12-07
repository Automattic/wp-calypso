/** @format */
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
 * @param {Object} state Redux state
 * @param {Number} siteId Site for whose comments to find
 * @param {String} [status] Status to filter comments
 * @returns {Array<Object>} Comments tree for site, filtered by status
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
