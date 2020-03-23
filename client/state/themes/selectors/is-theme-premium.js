/**
 * Internal dependencies
 */
import { getTheme } from 'state/themes/selectors/get-theme';
import { isPremium } from 'state/themes/utils';

import 'state/themes/init';

/**
 * Whether a WPCOM theme given by its ID is premium.
 *
 * @param  {object} state   Global state tree
 * @param  {object} themeId Theme ID
 * @returns {boolean}        True if the theme is premium
 */
export function isThemePremium( state, themeId ) {
	return isPremium( getTheme( state, 'wpcom', themeId ) );
}
