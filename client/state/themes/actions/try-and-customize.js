/**
 * Internal dependencies
 */

import { isJetpackSite } from 'state/sites/selectors';
import { installAndTryAndCustomizeTheme } from 'state/themes/actions/install-and-try-and-customize-theme';
import { suffixThemeIdForInstall } from 'state/themes/actions/suffix-theme-id-for-install';
import { tryAndCustomizeTheme } from 'state/themes/actions/try-and-customize-theme';
import { getTheme } from 'state/themes/selectors';

import 'state/themes/init';

/**
 * Switches to the customizer to preview a given theme.
 * If it's a Jetpack site, installs the theme prior to activation if it isn't already.
 *
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @returns {Function}           Action thunk
 */
export function tryAndCustomize( themeId, siteId ) {
	return ( dispatch, getState ) => {
		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( getState(), siteId, themeId );
			// If theme is already installed, installation will silently fail,
			// and we just switch to the customizer.
			return dispatch( installAndTryAndCustomizeTheme( installId, siteId ) );
		}

		return dispatch( tryAndCustomizeTheme( themeId, siteId ) );
	};
}
