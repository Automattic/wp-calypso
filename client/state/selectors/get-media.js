/**
 * Returns media for a specified site ID and query.
 * 
 *
 * @format
 * @param {Object}  query  Query object
 * @return {?Array}         Media
 */

export default function getMedia( state, siteId, query ) {
	const queries = state.media.queries[ siteId ];

	if ( ! queries ) {
		return null;
	}

	return queries.getItems( query );
}
