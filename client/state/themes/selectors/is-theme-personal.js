import { getThemeTierForTheme } from 'calypso/state/themes/selectors/get-theme-tier-for-theme';

import 'calypso/state/themes/init';

/**
 * Whether a WPCOM theme given by its ID is personal.
 * @param  {Object} state   Global state tree
 * @param  {string} themeId Theme ID
 * @returns {boolean}        True if the theme is personal
 */
export function isThemePersonal( state, themeId ) {
	const themeTier = getThemeTierForTheme( state, themeId );
	if ( themeTier?.slug ) {
		return 'personal' === themeTier?.slug;
	}
	return false;
}
