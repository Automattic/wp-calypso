import i18n from 'i18n-calypso';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { isPremiumThemeAvailable } from 'calypso/state/themes/selectors/is-premium-theme-available';
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';
import 'calypso/state/themes/init';

/**
 * Returns the price string to display for a given theme on a given site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {number}  siteId  Site ID
 * @returns {string}          Price
 */
export function getPremiumThemePrice( state, themeId, siteId ) {
	if ( ! isThemePremium( state, themeId ) || isPremiumThemeAvailable( state, themeId, siteId ) ) {
		return '';
	}

	if ( isJetpackSite( state, siteId ) && ! isSiteAutomatedTransfer( state, siteId ) ) {
		return i18n.translate( 'Upgrade', {
			comment:
				'Used to indicate a premium theme is available to the user once they upgrade their plan',
		} );
	}

	const theme = getTheme( state, 'wpcom', themeId );
	return theme?.price;
}
