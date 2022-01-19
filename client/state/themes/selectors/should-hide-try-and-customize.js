import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import { isJetpackSite, isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import {
	isPremiumThemeAvailable,
	isThemeActive,
	isThemeGutenbergFirst,
	isThemePremium,
} from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

/**
 * Returns whether we should hide the "Try & Customize" action for a theme.
 *
 * @param {object} state   Global state tree
 * @param {string} themeId Theme ID to activate in the site.
 * @param {string} siteId  Site ID.
 * @returns {boolean}      True if the theme should hide the Try & Customize action. Otherwise, false.
 */
export function shouldHideTryAndCustomize( state, themeId, siteId ) {
	return (
		! isUserLoggedIn( state ) ||
		( siteId &&
			( ! canCurrentUser( state, siteId, 'edit_theme_options' ) ||
				( isJetpackSite( state, siteId ) && isJetpackSiteMultiSite( state, siteId ) ) ) ) ||
		isThemeActive( state, themeId, siteId ) ||
		( isThemePremium( state, themeId ) &&
			isJetpackSite( state, siteId ) &&
			! isPremiumThemeAvailable( state, themeId, siteId ) ) ||
		isThemeGutenbergFirst( state, themeId )
	);
}
