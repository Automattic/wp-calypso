/**
 * Internal dependencies
 */
import { installTheme } from 'state/themes/actions/install-theme';
import { tryAndCustomizeTheme } from 'state/themes/actions/try-and-customize-theme';

import 'state/themes/init';

/**
 * Triggers a network request to install theme on Jetpack site.
 * After installataion it switches page to the customizer
 * See installTheme doc for install options.
 * Requires Jetpack 4.4
 *
 * @param  {string}   themeId      WP.com Theme ID
 * @param  {string}   siteId       Jetpack Site ID
 * @returns {Function}              Action thunk
 */
export function installAndTryAndCustomizeTheme( themeId, siteId ) {
	return ( dispatch ) => {
		return dispatch( installTheme( themeId, siteId ) ).then( () => {
			dispatch( tryAndCustomizeTheme( themeId, siteId ) );
		} );
	};
}
