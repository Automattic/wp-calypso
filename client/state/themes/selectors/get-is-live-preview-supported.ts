import config from '@automattic/calypso-config';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import { isMarketplaceThemeSubscribed } from 'calypso/state/themes/selectors/is-marketplace-theme-subscribed';
import { AppState } from 'calypso/types';
import {
	isWporgTheme,
	isThemeActive,
	isFullSiteEditingTheme,
	isExternallyManagedTheme,
	canUseTheme,
	isSiteEligibleForManagedExternalThemes,
} from '.';

/**
 * Hardcoded list of themes that are NOT compatible with Block Theme Previews.
 * This list should be removed once they are retired.
 * @see pekYwv-284-p2
 */
const NOT_COMPATIBLE_THEMES = [
	// premium themes (premium/*)
	'alonso',
	'baxter',
	'byrne',
	'kerr',
	'munchies',
	'payton',
	'skivers',
	'thriving-artist',

	// free themes (pub/*)
	'ames',
	'antonia',
	'appleton',
	'arbutus',
	'attar',
	'barnett',
	'bennett',
	'calvin',
	'calyx',
	'course',
	'dorna',
	'farrow',
	'geologist-blue',
	'geologist-cream',
	'geologist-slate',
	'geologist-yellow',
	'hari',
	'heiwa',
	'jackson',
	'kingsley',
	'marl',
	'meraki',
	'quadrat-black',
	'quadrat-green',
	'quadrat-red',
	'quadrat-white',
	'quadrat-yellow',
	'quadrat',
	'russell',
	'seedlet-blocks',
	'winkel',
];

const isNotCompatibleThemes = ( themeId: string ) => {
	return NOT_COMPATIBLE_THEMES.includes( themeId );
};

/**
 * Check if Live Preview is supported.
 *
 * The scenarios where the Live Preview does NOT support;
 * - On both Simple and Atomic sites;
 *   - If the user is NOT logged in.
 *   - If the theme is users' active theme.
 *   - If the theme is NOT FullSiteEditing compatible.
 *   - If the theme has a static page as a homepage.
 * - On Atomic sites;
 *   - If the theme is externally managed and a user is NOT subscribed to the theme.
 * - On Simple sites;
 *   - If the theme is externally managed.
 *   - If the theme is a wporg theme.
 *   - If the theme is NOT included in a plan.
 * @see pbxlJb-3Uv-p2
 */
export const getIsLivePreviewSupported = ( state: AppState, themeId: string, siteId: number ) => {
	if ( ! config.isEnabled( 'themes/block-theme-previews' ) ) {
		return false;
	}

	// The "Live" Preview does NOT make sense for logged out users.
	if ( ! isUserLoggedIn( state ) ) {
		return false;
	}

	// The "Live" Preview does NOT make sense for no selected site.
	if ( ! siteId ) {
		return false;
	}

	// A user doesn't want to preview the active theme.
	if ( isThemeActive( state, themeId, siteId ) ) {
		return false;
	}

	// A theme should be FullSiteEditing compatible to use Block Theme Previews.
	if ( ! isFullSiteEditingTheme( state, themeId, siteId ) ) {
		return false;
	}

	/**
	 * Block Theme Previews do NOT support themes with a static page as a homepage
	 * as the Site Editor cannot control Reading Settings.
	 * @see pekYwv-284-p2#background
	 */
	if ( isNotCompatibleThemes( themeId ) ) {
		return false;
	}

	/**
	 * If the theme is externally managed,
	 * a user must be subscribed to the theme,
	 * AND the site must be eligible for managed external themes.
	 */
	if (
		isExternallyManagedTheme( state, themeId ) &&
		( ! isMarketplaceThemeSubscribed( state, themeId, siteId ) ||
			! isSiteEligibleForManagedExternalThemes( state, siteId ) )
	) {
		return false;
	}

	const isSimple = isSimpleSite( state, siteId );
	if ( isSimple ) {
		/**
		 * Disable Live Preview for externally managed themes on Simple sites.
		 * The theme is NOT installed on Simple sites even if a user is still subscribed to the theme.
		 * This should happen only when the site went back to Simple from Atomic.
		 */
		if ( isExternallyManagedTheme( state, themeId ) ) {
			return false;
		}

		/**
		 * Disable Live Preview for wporg themes,
		 * since Simple sites do NOT have wporg themes installed.
		 */
		if ( isWporgTheme( state, themeId ) ) {
			return false;
		}

		/**
		 * Disable Live Preview for themes that are NOT included in a plan.
		 * This should be updated as we implement the flow for them.
		 * Note that BTP works on Atomic sites if a theme is installed.
		 * @see https://github.com/Automattic/wp-calypso/issues/79223
		 */
		if ( ! canUseTheme( state, siteId, themeId ) ) {
			return false;
		}
	}

	return true;
};
