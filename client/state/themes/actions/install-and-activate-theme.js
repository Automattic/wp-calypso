import { activateTheme } from 'calypso/state/themes/actions/activate-theme';
import { installTheme } from 'calypso/state/themes/actions/install-theme';

import 'calypso/state/themes/init';

/**
 * Triggers a network request to install and activate a specific theme on a given
 * Jetpack site. If the themeId parameter is suffixed with '-wpcom', install the
 * theme from WordPress.com. Otherwise, install from WordPress.org.
 * @param {string} themeId   Theme ID. If suffixed with '-wpcom', install theme from WordPress.com
 * @param {number} siteId    Site ID
 * @param {Object} [options] The options
 * @param {string} [options.source]     The source that is requesting theme activation, e.g. 'showcase'
 * @param {boolean} [options.purchased] Whether the theme has been purchased prior to activation
 * @returns {Function}       Action thunk
 */
export function installAndActivateTheme( themeId, siteId, options ) {
	return ( dispatch ) => {
		return dispatch( installTheme( themeId, siteId ) ).then( () =>
			// This will be called even if `installTheme` silently fails. We rely on
			// `activateTheme`'s own error handling here.
			dispatch( activateTheme( themeId, siteId, options ) )
		);
	};
}
