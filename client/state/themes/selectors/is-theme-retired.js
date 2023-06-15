import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { isRetired } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Whether a WPCOM theme given by its ID is retired.
 *
 * @param  {Object} state   Global state tree
 * @param  {string} themeId Theme ID
 * @returns {boolean}        True if the theme is retired
 */
export function isThemeRetired( state, themeId ) {
	return isRetired( getTheme( state, 'wpcom', themeId ) );
}
