/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

/**
 * Returns whether the theme activation action is currently ongoing on the site.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if theme activation is ongoing
 */
export function isActivatingTheme( state, siteId ) {
	return state.themes.activationRequests[ siteId ] ?? false;
}
