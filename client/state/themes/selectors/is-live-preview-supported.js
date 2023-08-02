import config from '@automattic/calypso-config';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { isSimpleSite } from 'calypso/state/sites/selectors';
import {
	isWporgTheme,
	isThemeActive,
	isFullSiteEditingTheme,
	getTheme,
	isExternallyManagedTheme,
	canUseTheme,
} from '../selectors';

/**
 * Hardcoded list of themes that are not compatible with Block Theme Previews.
 * This list should be removed once they are retired.
 *
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

const isNotCompatibleThemes = ( themeId ) => {
	return NOT_COMPATIBLE_THEMES.includes( themeId );
};

/**
 * Check if Live Preview is supported.
 *
 * The scenarios where the Live Preview does NOT support;
 * - On both Simple and Atomic sites;
 *   - If the theme is users' active theme.
 *   - If the theme is not FullSiteEditing compatible.
 *   - If the theme has a static page as a homepage.
 * - On Atomic sites;
 *   - If the theme is not installed on Atomic sites.
 * - On Simple sites;
 *   - If the theme is a 3rd party theme.
 *   - If the theme is not included in a plan.
 *
 * @see pbxlJb-3Uv-p2
 */
export const getIsLivePreviewSupported = ( state, themeId, siteId ) => {
	if ( ! config.isEnabled( 'themes/block-theme-previews' ) ) {
		return false;
	}

	// The "Live" Preview does not make sense for logged out users.
	if ( ! isUserLoggedIn( state ) ) {
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
	 * Block Theme Previews do not support themes with a static page as a homepage
	 * as the Site Editor cannot control Reading Settings.
	 *
	 * @see pekYwv-284-p2#background
	 */
	if ( isNotCompatibleThemes( themeId ) ) {
		return false;
	}

	// Block Theme Previews need the theme installed on Atomic sites.
	const isAtomic = isSiteAutomatedTransfer( state, siteId );
	const isThemeInstalledOnAtomicSite = isAtomic && !! getTheme( state, siteId, themeId );
	if ( isAtomic && ! isThemeInstalledOnAtomicSite ) {
		return false;
	}

	const isSimple = isSimpleSite( state, siteId );
	if ( isSimple ) {
		/**
		 * Disable Live Preview for 3rd party themes, as Block Theme Previews need a theme installed.
		 * Note that BTP works on Atomic sites if a theme is installed.
		 */
		if ( isExternallyManagedTheme( state, themeId ) || isWporgTheme( state, themeId ) ) {
			return false;
		}

		/**
		 * Disable Live Preview for themes that are not included in a plan.
		 * This should be updated as we implement the flow for them.
		 * Note that BTP works on Atomic sites if a theme is installed.
		 *
		 * @see https://github.com/Automattic/wp-calypso/issues/79223
		 */
		if ( ! canUseTheme( state, siteId, themeId ) ) {
			return false;
		}
	}

	return true;
};
