import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import isSiteWpcomAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { isJetpackSite, isJetpackSiteMultiSite } from 'calypso/state/sites/selectors';
import {
	isExternallyManagedTheme,
	isMarketplaceThemeSubscribed,
	isPremiumThemeAvailable,
	isThemeActive,
	isThemeGutenbergFirst,
	isThemePremium,
	isWpcomTheme,
} from 'calypso/state/themes/selectors';

import 'calypso/state/themes/init';

/**
 * Returns whether we should hide the "Try & Customize" action for a theme.
 *
 * @param {object} state   Global state tree
 * @param {string} themeId Theme ID to activate in the site.
 * @param {string} siteId  Site ID.
 * @returns {boolean}      True if the theme should show the Try & Customize action. Otherwise, false.
 */
export function shouldShowTryAndCustomize( state, themeId, siteId ) {
	/*
	 * If we're viewing a specific site and user does not have permissions, bail
	 */
	if ( siteId && ! canCurrentUser( state, siteId, 'edit_theme_options' ) ) {
		return false;
	}

	/*
	 * If this is a Marketplace theme, i.e. externally managed,
	 * we can only show the customizer if the site is Atomic and has purchased the theme
	 */
	if ( isExternallyManagedTheme( state, themeId ) ) {
		return (
			siteId &&
			isSiteWpcomAtomic( state, siteId ) &&
			isMarketplaceThemeSubscribed( state, themeId, siteId )
		);
	}

	/*
	 * If we're on a Jetpack site and it's multisite,
	 * or the theme is premium and it's not supported, bail
	 */
	if ( siteId && isJetpackSite( state, siteId ) ) {
		if (
			isJetpackSiteMultiSite( state, siteId ) ||
			( isThemePremium( state, themeId ) && ! isPremiumThemeAvailable( state, themeId, siteId ) )
		) {
			return false;
		}
	}

	/**
	 * If displaying a WP.org theme on a non-atomic site, bail
	 */
	if ( ! isWpcomTheme( state, themeId ) && ! isSiteWpcomAtomic( state, siteId ) ) {
		return false;
	}

	return (
		isUserLoggedIn( state ) && // User is logged in
		! isThemeGutenbergFirst( state, themeId ) && // Theme is not Gutenberg first
		! isThemeActive( state, themeId, siteId ) // Theme is not currently active
	);
}
