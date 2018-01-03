/** @format */

/**
 * Creates a filters key to be used in the `ui.comments.queries` state.
 * E.g. `ui.comments.queries.${ siteId }.${ postId }.${ 'approved?s=foo' }.${ page }`
 *
 * @param {Object} query Filter parameters.
 * @param {String} [query.search] Search query.
 * @param {String} query.status Comments status.
 * @returns {String} Filter key.
 */
export const getFiltersKey = ( { search, status = 'all' } ) =>
	!! search ? `${ status }?s=${ search }` : status;
