/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

/**
 * Returns whether the theme activation action has finished on the site.
 *
 * @param  {object}  state   Global state tree
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if the theme activation has finished
 */
export function hasActivatedTheme( state, siteId ) {
	return state.themes.completedActivationRequests[ siteId ] ?? false;
}
