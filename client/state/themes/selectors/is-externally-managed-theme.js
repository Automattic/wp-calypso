import { isEnabled } from '@automattic/calypso-config';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

/**
 * Check if a theme is externally managed. If true, this means that the theme is not
 * managed by Automattic, but by a third party.
 *
 * @param {object} state Global state tree
 * @param {string} themeId Theme ID
 * @returns {boolean} True if the theme is externally managed.
 */
export function isExternallyManagedTheme( state, themeId ) {
	const { theme_type } = getTheme( state, 'wpcom', themeId ) || {};
	return (
		isEnabled( 'themes/third-party-premium' ) && !! theme_type && theme_type === 'managed-external'
	);
}
