/** @format */
/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { COMMENTS_PER_PAGE } from 'my-sites/comments/constants';
import createSelector from 'lib/create-selector';

/**
 * Returns a list of comment IDs for the requested page.
 *
 * @param {Object} state Redux state.
 * @param {Number} siteId Site identifier.
 * @param {Number} offset Offset to determine the requested page.
 * @param {String} status Comments status filter.
 * @param {Number} [postId] Post identifier.
 * @param {String} [search] Search query.
 * @returns {Array} List of comment IDs for the requested page.
 */
export const getCommentsPage = createSelector(
	( state, siteId, offset = 0, status = 'all', postId, search ) => {
		const parent = postId || 'site';
		const filter = !! search ? `${ status }?s=${ search }` : status;
		const pageNumber = offset / COMMENTS_PER_PAGE + 1;
		const siteComments = get( state, [ 'ui', 'comments', 'queries', siteId ] );
		return get( siteComments, [ parent, filter, pageNumber ], [] );
	},
	( state, siteId ) => [ get( state, [ 'ui', 'comments', 'queries', siteId ] ) ]
);

export default getCommentsPage;
