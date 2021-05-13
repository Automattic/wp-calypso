/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import {
	THEME_INSTALL,
	THEME_INSTALL_SUCCESS,
	THEME_INSTALL_FAILURE,
} from 'calypso/state/themes/action-types';
import { receiveTheme } from 'calypso/state/themes/actions/receive-theme';
import { getWpcomParentThemeId } from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

/**
 * Triggers a network request to install a WordPress.org or WordPress.com theme on a Jetpack site.
 * To install a theme from WordPress.com, suffix the theme name with '-wpcom'. Note that this options
 * requires Jetpack 4.4
 *
 * @param  {string}   themeId Theme ID. If suffixed with '-wpcom', install from WordPress.com
 * @param  {string}   siteId  Jetpack Site ID
 * @returns {Function}         Action thunk
 */
export function installTheme( themeId, siteId ) {
	return ( dispatch, getState ) => {
		dispatch( {
			type: THEME_INSTALL,
			siteId,
			themeId,
		} );

		return wpcom
			.undocumented()
			.installThemeOnJetpack( siteId, themeId )
			.then( ( theme ) => {
				dispatch( receiveTheme( theme, siteId ) );
				dispatch( {
					type: THEME_INSTALL_SUCCESS,
					siteId,
					themeId,
				} );

				// Install parent theme if theme requires one
				if ( themeId.endsWith( '-wpcom' ) ) {
					const parentThemeId = getWpcomParentThemeId(
						getState(),
						themeId.replace( '-wpcom', '' )
					);
					if ( parentThemeId ) {
						return dispatch( installTheme( parentThemeId + '-wpcom', siteId ) );
					}
				}
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEME_INSTALL_FAILURE,
					siteId,
					themeId,
					error,
				} );
			} );
	};
}
