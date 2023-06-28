import 'calypso/state/themes/init';

import { getTheme, doesThemeBundleSoftwareSet, isExternallyManagedTheme } from '.';

/**
 * Returns whether it should redirect to thank you page
 * after to activate a theme.
 *
 * @param {Object} state
 * @param {string} themeId
 * @returns {boolean}
 */
export function shouldRedirectToThankYouPage( state, themeId ) {
	const isWooTheme = doesThemeBundleSoftwareSet( state, themeId );
	const isDotComTheme = !! getTheme( state, 'wpcom', themeId );
	const isExternallyManaged = isExternallyManagedTheme( state, themeId );
	return isDotComTheme && ! isWooTheme && ! isExternallyManaged;
}
