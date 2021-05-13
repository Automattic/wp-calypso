/**
 * Internal dependencies
 */
import { getTheme } from 'calypso/state/themes/selectors/get-theme';

import 'calypso/state/themes/init';

/**
 * Returns id of the parent theme, if any, for a wpcom theme.
 *
 * @param {object} state Global state tree
 * @param {string} themeId Child theme ID
 *
 * @returns {?string} Parent theme id if it exists
 */
export function getWpcomParentThemeId( state, themeId ) {
	return getTheme( state, 'wpcom', themeId )?.template ?? null;
}
