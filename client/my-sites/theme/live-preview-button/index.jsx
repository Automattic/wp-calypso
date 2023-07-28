import { Button } from '@automattic/components';

/**
 * Hardcoded list of themes that are not compatible with Block Theme Previews.
 * This list should be removed once they are retired.
 *
 * @see pekYwv-284-p2
 */
const NOT_COMPATIBLE_THEMES = [
	'premium/alonso',
	'premium/baxter',
	'premium/byrne',
	'premium/kerr',
	'premium/munchies',
	'premium/payton',
	'premium/skivers',
	'premium/thriving-artist',
	'pub/ames',
	'pub/antonia',
	'pub/appleton',
	'pub/arbutus',
	'pub/attar',
	'pub/barnett',
	'pub/bennett',
	'pub/calvin',
	'pub/calyx',
	'pub/course',
	'pub/dorna',
	'pub/farrow',
	'pub/geologist-blue',
	'pub/geologist-cream',
	'pub/geologist-slate',
	'pub/geologist-yellow',
	'pub/hari',
	'pub/heiwa',
	'pub/jackson',
	'pub/kingsley',
	'pub/marl',
	'pub/meraki',
	'pub/quadrat-black',
	'pub/quadrat-green',
	'pub/quadrat-red',
	'pub/quadrat-white',
	'pub/quadrat-yellow',
	'pub/quadrat',
	'pub/russell',
	'pub/seedlet-blocks',
	'pub/winkel',
];

const isNotCompatibleThemes = ( stylesheet ) => {
	return NOT_COMPATIBLE_THEMES.includes( stylesheet );
};

/**
 * Live Preview leveraging Gutenberg's Block Theme Previews
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
export const LivePreviewButton = ( {
	canUseTheme,
	isActive,
	isAtomic,
	isExternallyManagedTheme,
	isFullSiteEditingTheme,
	isSimple,
	isThemeInstalledOnAtomicSite,
	isWporg,
	siteSlug,
	stylesheet,
	themeId,
	translate,
} ) => {
	// A user doesn't want to preview the active theme.
	if ( isActive ) {
		return null;
	}

	// A theme should be FullSiteEditing compatible to use Block Theme Previews.
	if ( ! isFullSiteEditingTheme ) {
		return null;
	}

	/**
	 * Block Theme Previews do not support themes with a static page as a homepage
	 * as the Site Editor cannot control Reading Settings.
	 *
	 * @see pekYwv-284-p2#background
	 */
	if ( isNotCompatibleThemes( stylesheet ) ) {
		return null;
	}

	// Block Theme Previews need the theme installed on Atomic sites.
	if ( isAtomic && ! isThemeInstalledOnAtomicSite ) {
		return null;
	}

	if ( isSimple ) {
		/**
		 * Disable Live Preview for 3rd party themes, as Block Theme Previews need a theme installed.
		 * Note that BTP works on Atomic sites if a theme is installed.
		 */
		if ( isExternallyManagedTheme || isWporg ) {
			return null;
		}

		/**
		 * Disable Live Preview for themes that are not included in a plan.
		 * This should be updated as we implement the flow for them.
		 * Note that BTP works on Atomic sites if a theme is installed.
		 *
		 * @see https://github.com/Automattic/wp-calypso/issues/79223
		 */
		if ( ! canUseTheme ) {
			return null;
		}
	}

	const themePath = isAtomic ? themeId : stylesheet;

	return (
		<Button
			href={ `https://${ siteSlug }/wp-admin/site-editor.php?wp_theme_preview=${ themePath }` }
		>
			{ translate( 'Live Preview' ) }
		</Button>
	);
};
