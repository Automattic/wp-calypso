/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import accept from 'lib/accept';
import { getSiteTitle } from 'state/sites/selectors';
import { deleteTheme } from 'state/themes/actions/delete-theme';
import { getTheme } from 'state/themes/selectors';

import 'state/themes/init';

/**
 * Shows dialog asking user to confirm delete of theme
 * from jetpack site. Deletes theme if user confirms.
 *
 * @param {string} themeId -- Theme to delete
 * @param {number} siteId -- Site to delete theme from
 *
 * @returns {Function} Action thunk
 */
export function confirmDelete( themeId, siteId ) {
	return ( dispatch, getState ) => {
		const { name: themeName } = getTheme( getState(), siteId, themeId );
		const siteTitle = getSiteTitle( getState(), siteId );
		accept(
			i18n.translate( 'Are you sure you want to delete %(themeName)s from %(siteTitle)s?', {
				args: { themeName, siteTitle },
				comment: 'Themes: theme delete confirmation dialog',
			} ),
			( accepted ) => {
				accepted && dispatch( deleteTheme( themeId, siteId ) );
			},
			i18n.translate( 'Delete %(themeName)s', {
				args: { themeName },
				comment: 'Themes: theme delete dialog confirm button',
			} ),
			i18n.translate( 'Back', { context: 'go back (like the back button in a browser)' } )
		);
	};
}
