/**
 * Internal dependencies
 */
import { isJetpackSite } from 'state/sites/selectors';
import { activateTheme } from 'state/themes/actions/activate-theme';
import { installAndActivateTheme } from 'state/themes/actions/install-and-activate-theme';
import { showAutoLoadingHomepageWarning } from 'state/themes/actions/show-auto-loading-homepage-warning';
import { suffixThemeIdForInstall } from 'state/themes/actions/suffix-theme-id-for-install';
import {
	getTheme,
	hasAutoLoadingHomepageModalAccepted,
	themeHasAutoLoadingHomepage,
} from 'state/themes/selectors';

import 'state/themes/init';

/**
 * Triggers a network request to activate a specific theme on a given site.
 * If it's a Jetpack site, installs the theme prior to activation if it isn't already.
 *
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @param  {string}   source    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased Whether the theme has been purchased prior to activation
 * @returns {Function}          Action thunk
 */
export function activate( themeId, siteId, source = 'unknown', purchased = false ) {
	return ( dispatch, getState ) => {
		/**
		 * Let's check if the theme will change the homepage of the site,
		 * before to definitely start the theme-activating process,
		 * allowing cancel it if it's desired.
		 */
		if (
			themeHasAutoLoadingHomepage( getState(), themeId ) &&
			! hasAutoLoadingHomepageModalAccepted( getState(), themeId )
		) {
			return dispatch( showAutoLoadingHomepageWarning( themeId ) );
		}

		if ( isJetpackSite( getState(), siteId ) && ! getTheme( getState(), siteId, themeId ) ) {
			const installId = suffixThemeIdForInstall( getState(), siteId, themeId );
			// If theme is already installed, installation will silently fail,
			// and it will just be activated.
			return dispatch( installAndActivateTheme( installId, siteId, source, purchased ) );
		}

		return dispatch( activateTheme( themeId, siteId, source, purchased ) );
	};
}
