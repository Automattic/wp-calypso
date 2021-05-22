/**
 * Internal dependencies
 */
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

/**
 * When wpcom themes are installed on Jetpack sites, the
 * theme id is suffixed with -wpcom. Some operations require
 * the use of this suffixed ID. This util function adds the
 * suffix if the site is jetpack and the theme is not yet
 * installed on the site.
 *
 * @param {object} state	Global state tree
 * @param {string} themeId	Theme ID
 * @param {number} siteId	Site ID
 * @returns {string} 		Potentially suffixed theme ID
 */
const getSuffixedThemeId = ( state, themeId, siteId ) => {
	const siteIsJetpack = siteId && isJetpackSite( state, siteId );
	if ( siteIsJetpack && ! getTheme( state, siteId, themeId ) ) {
		return `${ themeId }-wpcom`;
	}
	return themeId;
};

/**
 * Whether the theme is currently being installed on the (Jetpack) site.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID for which we check installing state
 * @param  {number}  siteId  Site ID
 * @returns {boolean}         True if theme installation is ongoing
 */
export function isInstallingTheme( state, themeId, siteId ) {
	const suffixedThemeId = getSuffixedThemeId( state, themeId, siteId );
	return state.themes.themeInstalls[ siteId ]?.[ suffixedThemeId ] ?? false;
}
