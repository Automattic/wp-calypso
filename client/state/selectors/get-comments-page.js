/** @format */
/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';

/**
 * Returns a list of comment IDs for the requested page.
 *
 * @param {Object} state Redux state.
 * @param {Number} siteId Site identifier.
 * @param {Number} page Requested page.
 * @param {String} status Comments status filter.
 * @param {Number} [postId] Post identifier.
 * @param {String} [search] Search query.
 * @returns {Array} List of comment IDs for the requested page.
 */
export const getCommentsPage = createSelector(
	( state, siteId, page = 1, status = 'all', postId, search ) => {
		const parent = postId || 'site';
		const filter = !! search ? `${ status }?s=${ search }` : status;
		const siteComments = get( state, [ 'ui', 'comments', 'queries', siteId ] );
		return get( siteComments, [ parent, filter, page ], [] );
	},
	( state, siteId ) => [ get( state, [ 'ui', 'comments', 'queries', siteId ] ) ]
);

export default getCommentsPage;
