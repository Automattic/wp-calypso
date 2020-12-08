/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getFiltersKey } from 'calypso/state/comments/ui/utils';

import 'calypso/state/comments/init';

/**
 * Returns a list of comment IDs for the requested page and filters.
 *
 * @param {object} state Redux state.
 * @param {number} siteId Site identifier.
 * @param {object} query Filter parameters.
 * @param {string} [query.order] Query order ('ASC' or 'DESC').
 * @param {number} [query.page] Requested page.
 * @param {number} [query.postId] Post identifier.
 * @param {string} [query.search] Search query.
 * @param {string} [query.status] Comments status.
 * @returns {Array} List of comment IDs for the requested page and filters.
 */
export const getCommentsPage = ( state, siteId, query ) => {
	const { page = 1, postId } = query;
	const parent = postId || 'site';
	const filter = getFiltersKey( query );
	return get( state, [ 'comments', 'ui', 'queries', siteId, parent, filter, page ] );
};

export default getCommentsPage;
