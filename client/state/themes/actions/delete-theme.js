/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	THEME_DELETE_FAILURE,
	THEME_DELETE_SUCCESS,
	THEME_DELETE,
} from 'state/themes/action-types';

import 'state/themes/init';

/**
 * Deletes a theme from the given Jetpack site.
 *
 * @param {string} themeId -- Theme to delete
 * @param {number} siteId -- Site to delete theme from
 *
 * @returns {Function} Action thunk
 */
export function deleteTheme( themeId, siteId ) {
	return ( dispatch ) => {
		dispatch( {
			type: THEME_DELETE,
			themeId,
			siteId,
		} );
		return wpcom
			.undocumented()
			.deleteThemeFromJetpack( siteId, themeId )
			.then( ( theme ) => {
				dispatch( {
					type: THEME_DELETE_SUCCESS,
					themeId,
					siteId,
					themeName: theme.name,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEME_DELETE_FAILURE,
					themeId,
					siteId,
					error,
				} );
			} );
	};
}
