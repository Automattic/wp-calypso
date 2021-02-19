/**
 * Internal dependencies
 */
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';
import { isWpcomTheme } from 'calypso/state/themes/selectors/is-wpcom-theme';
import { isWporgTheme } from 'calypso/state/themes/selectors/is-wporg-theme';

import 'calypso/state/themes/init';

/**
 * Returns the URL for a premium theme's dedicated forum, or for the general themes
 * forum for a free theme.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {?string}         Theme forum URL
 */
export function getThemeForumUrl( state, themeId ) {
	if ( isThemePremium( state, themeId ) ) {
		return '//premium-themes.forums.wordpress.com/forum/' + themeId;
	}
	if ( isWpcomTheme( state, themeId ) ) {
		return '//en.forums.wordpress.com/forum/themes';
	}
	if ( isWporgTheme( state, themeId ) ) {
		return '//wordpress.org/support/theme/' + themeId;
	}
	return null;
}
