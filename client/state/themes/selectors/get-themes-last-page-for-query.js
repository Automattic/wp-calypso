/**
 * Internal dependencies
 */
import { isJetpackSite } from 'calypso/state/sites/selectors';

import 'calypso/state/themes/init';

/**
 * Returns the last queryable page of themes for the given query, or null if the
 * total number of queryable themes if unknown.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {object}  query  Theme query object
 * @returns {?number}        Last themes page
 */
export function getThemesLastPageForQuery( state, siteId, query ) {
	if ( ! state.themes.queries[ siteId ] ) {
		return null;
	}

	const pages = state.themes.queries[ siteId ]?.getNumberOfPages( query );
	if ( null === pages ) {
		return null;
	}

	// No pagination on Jetpack sites -- everything is returned at once, i.e. on one page
	if ( isJetpackSite( state, siteId ) ) {
		return 1;
	}

	return Math.max( pages, 1 );
}
