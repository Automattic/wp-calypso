/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'calypso/lib/wp';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';
import {
	THEME_DELETE_FAILURE,
	THEME_DELETE_SUCCESS,
	THEME_DELETE,
} from 'calypso/state/themes/action-types';

import 'calypso/state/themes/init';

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
			.then( ( { name: themeName } ) => {
				dispatch( {
					type: THEME_DELETE_SUCCESS,
					themeId,
					siteId,
					themeName,
				} );
				dispatch(
					successNotice(
						translate( 'Deleted theme %(themeName)s.', {
							args: { themeName },
							context: 'Themes: Theme delete confirmation',
						} ),
						{ duration: 5000 }
					)
				);
			} )
			.catch( ( error ) => {
				dispatch( {
					type: THEME_DELETE_FAILURE,
					themeId,
					siteId,
					error,
				} );
				dispatch(
					errorNotice(
						translate( 'Problem deleting %(themeId)s. Check theme is not active.', {
							args: { themeId },
							context: 'Themes: Theme delete failure',
						} )
					)
				);
			} );
	};
}
