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
	//Hide the Try & Customize action when....
	return (
		! isUserLoggedIn( state ) || // The user is not logged in.
		( siteId && // We're in a site-specific context...
			( ! canCurrentUser( state, siteId, 'edit_theme_options' ) || // ...and the user lacks permission to edit theme options
				( isJetpackSite( state, siteId ) && isJetpackSiteMultiSite( state, siteId ) ) ) ) || // ...or we're using a self-hosted multisite instance
		isThemeActive( state, themeId, siteId ) || // The theme is currently active
		( isThemePremium( state, themeId ) && // The theme is premium...
			isJetpackSite( state, siteId ) && // ... and we're on a Jetpack site...
			! isPremiumThemeAvailable( state, themeId, siteId ) ) || // and the premium theme can't activated on the site
		isThemeGutenbergFirst( state, themeId ) // The theme is Gutenberg-first
	);
}
