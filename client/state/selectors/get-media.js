/**
 * Returns media for a specified site ID and query.
 *
 *
 * @param {object}  query  Query object
 * @returns {?Array}         Media
 */

export default function getMedia( state, siteId, query ) {
	const queries = state.media.queries[ siteId ];

	if ( ! queries ) {
		return null;
	}

	return queries.getItems( query );
}
