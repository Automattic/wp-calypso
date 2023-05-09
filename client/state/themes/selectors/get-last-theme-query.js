import 'calypso/state/themes/init';

const emptyObject = {};

/**
 * Returns last query used.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {Object}         Last query
 */
export function getLastThemeQuery( state, siteId ) {
	return state.themes.lastQuery[ siteId ] ?? emptyObject;
}
