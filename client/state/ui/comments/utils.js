/** @format */
/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Creates a filters key to be used in the `ui.comments.queries` state.
 * E.g. `ui.comments.queries.${ siteId }.${ postId }.${ 'approved?s=foo' }.${ page }`
 *
 * @param {Object} query Filter parameters.
 * @param {String} [query.order] Query order ('ASC' or 'DESC').
 * @param {String} [query.search] Search query.
 * @param {String} query.status Comments status.
 * @returns {String} Filter key.
 */
export const getFiltersKey = ( { order, search, status = 'all' } ) => {
	const orderFilter = includes( [ 'ASC', 'DESC' ], order ) ? order : 'DESC';
	const searchFilter = !! search ? `&s=${ search }` : '';
	return `${ status }?order=${ orderFilter }${ searchFilter }`;
};
