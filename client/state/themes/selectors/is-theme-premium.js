import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { getThemeTierForTheme } from 'calypso/state/themes/selectors/get-theme-tier-for-theme';
import { isPremium } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Whether a WPCOM theme given by its ID is premium.
 * @param  {Object} state   Global state tree
 * @param  {string} themeId Theme ID
 * @returns {boolean}        True if the theme is premium
 */
export function isThemePremium( state, themeId ) {
	const themeTier = getThemeTierForTheme( state, themeId );
	if ( themeTier?.slug ) {
		return 'premium' === themeTier?.slug;
	}
	return isPremium( getTheme( state, 'wpcom', themeId ) );
}
