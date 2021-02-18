/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

/**
 * Returns true if a request is in progress for the site active theme, or
 * false otherwise.
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @returns {boolean}        Whether request is in progress
 */
export function isRequestingActiveTheme( state, siteId ) {
	return state.themes.activeThemeRequests[ siteId ] ?? false;
}
