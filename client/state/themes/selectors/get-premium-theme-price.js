/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { isJetpackSite } from 'state/sites/selectors';
import { getTheme } from 'state/themes/selectors/get-theme';
import { isThemePremium } from 'state/themes/selectors/is-theme-premium';
import { isPremiumThemeAvailable } from 'state/themes/selectors/is-premium-theme-available';

import 'state/themes/init';

/**
 * Returns the price string to display for a given theme on a given site.
 *
 * TODO Add tests!
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {number}  siteId  Site ID
 * @returns {string}          Price
 */
export function getPremiumThemePrice( state, themeId, siteId ) {
	if ( ! isThemePremium( state, themeId ) || isPremiumThemeAvailable( state, themeId, siteId ) ) {
		return '';
	}

	if ( isJetpackSite( state, siteId ) ) {
		return i18n.translate( 'Upgrade', {
			comment:
				'Used to indicate a premium theme is available to the user once they upgrade their plan',
		} );
	}

	const theme = getTheme( state, 'wpcom', themeId );
	return theme?.price;
}
