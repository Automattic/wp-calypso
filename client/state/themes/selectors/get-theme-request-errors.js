import 'calypso/state/themes/init';

/**
 * Returns theme request error object
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {number}  siteId  Site ID
 * @returns {Object}          error object if present or null otherwise
 */
export function getThemeRequestErrors( state, themeId, siteId ) {
	return state.themes.themeRequestErrors[ siteId ]?.[ themeId ] ?? null;
}
