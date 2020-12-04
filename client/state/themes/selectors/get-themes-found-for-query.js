/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

/**
 * Returns the total number of items reported to be found for the given query,
 * or null if the total number of queryable themes if unknown.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {object}  query  Theme query object
 * @returns {?number}        Total number of found items
 */
export function getThemesFoundForQuery( state, siteId, query ) {
	if ( ! state.themes.queries[ siteId ] ) {
		return null;
	}

	return state.themes.queries[ siteId ]?.getFound( query );
}
