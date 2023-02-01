import 'calypso/state/themes/init';

/**
 * Returns true if a theme request was successful.
 *
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  themeId Theme ID
 * @returns {boolean}        Whether the theme request was successful
 */
export function isThemeRequestSuccessful( state, siteId, themeId ) {
	return state.themes.themeRequestSuccessful[ siteId ]?.[ themeId ] ?? false;
}
