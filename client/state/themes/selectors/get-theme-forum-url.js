import { isWpcomTheme } from 'calypso/state/themes/selectors/is-wpcom-theme';
import { isWporgTheme } from 'calypso/state/themes/selectors/is-wporg-theme';

import 'calypso/state/themes/init';

/**
 * Returns the URL for the general support forum for a free theme.
 * or the WordPress.org theme forum for a WordPress.org theme.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {?string}         Theme forum URL
 */
export function getThemeForumUrl( state, themeId ) {
	if ( isWpcomTheme( state, themeId ) ) {
		return '//en.forums.wordpress.com/';
	}
	if ( isWporgTheme( state, themeId ) ) {
		return '//wordpress.org/support/theme/' + themeId;
	}
	return null;
}
