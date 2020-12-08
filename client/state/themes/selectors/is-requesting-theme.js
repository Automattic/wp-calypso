/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

/**
 * Returns true if a request is in progress for the specified site theme, or
 * false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  themeId Theme ID
 * @returns {boolean}        Whether request is in progress
 */
export function isRequestingTheme( state, siteId, themeId ) {
	return state.themes.themeRequests[ siteId ]?.[ themeId ] ?? false;
}
