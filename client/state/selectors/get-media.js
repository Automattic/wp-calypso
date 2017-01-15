/**
 * Returns media for a specified site ID and query.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Query object
 * @return {?Array}         Media
 */
export default function getMedia( state, siteId, query ) {
	const queries = state.media.queries[ siteId ];

	if ( ! queries ) {
		return null;
	}

	return queries.getItems( query );
}
