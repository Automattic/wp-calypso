import 'calypso/state/themes/init';

/**
 * Returns true if a request is in progress for the specified site theme, or
 * false otherwise.
 * @param  {Object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {string}  themeId Theme ID
 * @returns {boolean}        Whether request is in progress
 */
export function isRequestingTheme( state, siteId, themeId ) {
	return state.themes.themeRequests[ siteId ]?.[ themeId ] ?? false;
}
