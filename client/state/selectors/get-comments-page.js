/** @format */
/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns a list of comment IDs for the requested page and filters.
 *
 * @param {Object} state Redux state.
 * @param {Number} siteId Site identifier.
 * @param {Object} query Filter parameters.
 * @param {Number} [query.page] Requested page.
 * @param {Number} [query.postId] Post identifier.
 * @param {String} [query.search] Search query.
 * @param {String} [query.status] Comments status.
 * @returns {Array} List of comment IDs for the requested page and filters.
 */
export const getCommentsPage = ( state, siteId, { page = 1, postId, search, status = 'all' } ) => {
	const parent = postId || 'site';
	const filter = !! search ? `${ status }?s=${ search }` : status;
	return get( state, [ 'ui', 'comments', 'queries', siteId, parent, filter, page ], [] );
};

export default getCommentsPage;
