import { Button } from '@automattic/components';

/**
 * Hardcoded list of themes that are not compatible with Block Theme Previews.
 * This list should be removed once they are delisted/retired.
 *
 * TODO: Complete the list.
 */
const NOT_COMPATIBLE_THEMES = [ 'pub/appleton' ];

const isNotCompatibleThemes = ( stylesheet ) => {
	return NOT_COMPATIBLE_THEMES.includes( stylesheet );
};

/**
 * Live Preview leveraging Gutenberg's Block Theme Previews
 *
 * @see pbxlJb-3Uv-p2
 */
export const LivePreviewButton = ( {
	isActive,
	isAtomic,
	isExternallyManagedTheme,
	isFullSiteEditingTheme,
	isSimple,
	isThemeInstalledOnAtomicSite,
	isWporg,
	siteSlug,
	stylesheet,
	themeType,
	themeId,
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

	if ( isSimple ) {
		/**
		 * Disable Live Preview for 3rd party themes, as Block Theme Previews need a theme installed.
		 * Note that BTP works on Atomic sites if a theme is installed.
		 */
		if ( isExternallyManagedTheme || isWporg ) {
			return null;
		}

		/**
		 * Disable Live Preview for Premium/WooCommerce themes.
		 * This should be updated as we implement the flow for them.
		 * Note that BTP works on Atomic sites if a theme is installed.
		 *
		 * @see https://github.com/Automattic/wp-calypso/issues/79223
		 */
		if ( themeType === 'premium' || themeType === 'woocommerce' ) {
			return null;
		}
	} else if ( isAtomic ) {
		// Block Theme Previews need the theme installed on Atomic sites.
		if ( ! isThemeInstalledOnAtomicSite ) {
			return null;
		}
	}

	const themePath = isAtomic ? themeId : stylesheet;

	return (
			href={ `https://${ siteSlug }/wp-admin/site-editor.php?wp_theme_preview=${ themePath }` }
		>
			Live Preview
		</Button>
	);
};
