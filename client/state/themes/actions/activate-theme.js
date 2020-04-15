/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { THEME_ACTIVATE, THEME_ACTIVATE_FAILURE } from 'state/themes/action-types';
import { themeActivated } from 'state/themes/actions/theme-activated';

import 'state/themes/init';

/**
 * Triggers a network request to activate a specific theme on a given site.
 *
 * @param  {string}   themeId   Theme ID
 * @param  {number}   siteId    Site ID
 * @param  {string}   source    The source that is requesting theme activation, e.g. 'showcase'
 * @param  {boolean}  purchased Whether the theme has been purchased prior to activation
 * @returns {Function}           Action thunk
 */
export function activateTheme( themeId, siteId, source = 'unknown', purchased = false ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_ACTIVATE,
			themeId,
			siteId,
		} );

		return wpcom
			.undocumented()
			.activateTheme( themeId, siteId )
			.then( ( theme ) => {
				// Fall back to ID for Jetpack sites which don't return a stylesheet attr.
				const themeStylesheet = theme.stylesheet || themeId;
				dispatch( themeActivated( themeStylesheet, siteId, source, purchased ) );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEME_ACTIVATE_FAILURE,
					themeId,
					siteId,
					error,
				} );
			} );
	};
}
