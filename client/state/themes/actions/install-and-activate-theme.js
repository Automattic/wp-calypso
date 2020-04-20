/**
 * Internal dependencies
 */
import { activateTheme } from 'state/themes/actions/activate-theme';
import { installTheme } from 'state/themes/actions/install-theme';

import 'state/themes/init';

/**
 * Triggers a network request to install and activate a specific theme on a given
 * Jetpack site. If the themeId parameter is suffixed with '-wpcom', install the
 * theme from WordPress.com. Otherwise, install from WordPress.org.
 *
 * @param  {string}   themeId   Theme ID. If suffixed with '-wpcom', install theme from WordPress.com
 * @param  {number}   siteId    Site ID
 * @param  {string}   source    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased Whether the theme has been purchased prior to activation
 * @returns {Function}           Action thunk
 */
export function installAndActivateTheme( themeId, siteId, source = 'unknown', purchased = false ) {
	return ( dispatch ) => {
		return dispatch( installTheme( themeId, siteId ) ).then( () => {
			// This will be called even if `installTheme` silently fails. We rely on
			// `activateTheme`'s own error handling here.
			dispatch( activateTheme( themeId, siteId, source, purchased ) );
		} );
	};
}
