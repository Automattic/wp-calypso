import { isJetpackSite } from 'calypso/state/sites/selectors';
import { suffixThemeIdForInstall } from 'calypso/state/themes/actions/suffix-theme-id-for-install';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

/**
 * Whether the theme is currently being installed on the (Jetpack) site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID for which we check installing state
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if theme installation is ongoing
 */
export function isInstallingTheme( state, themeId, siteId ) {
	let suffixedThemeId = themeId;
	if ( isJetpackSite( state, siteId ) && ! getTheme( state, siteId, themeId ) ) {
		suffixedThemeId = suffixThemeIdForInstall( state, siteId, themeId );
	}
	return state.themes.themeInstalls[ siteId ]?.[ suffixedThemeId ] ?? false;
}
