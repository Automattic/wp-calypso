/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

const emptyObject = {};

/**
 * Returns last query used.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {object}         Last query
 */
export function getLastThemeQuery( state, siteId ) {
	return state.themes.lastQuery[ siteId ] ?? emptyObject;
}
