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
	isWporg,
	showTryAndCustomize,
	siteSlug,
	stylesheet,
} ) => {
	// A user doesn't want to preview the active theme.
	if ( isActive ) {
		return null;
	}

	// Block Theme Previews do not support Classic themes.
	if ( showTryAndCustomize ) {
		return null;
	}

	// Disable Live Preview for 3rd party themes, as Block Theme Previews need a theme installed.
	if ( isExternallyManagedTheme || isWporg ) {
		return null;
	}

	// Block Theme Previews need the theme installed.
	// TODO: Check if the theme is installed.
	const isInstalled = true;
	if ( isAtomic && ! isInstalled ) {
		return null;
	}

	/**
	 * Disable Live Preview for Premium/WooCommerce themes.
	 * This should be updated as we implement the flow for them.
	 *
	 * @see https://github.com/Automattic/wp-calypso/issues/79223
	 */
	// TODO:

	/**
	 * Block Theme Previews does not support themes with a static page as a homepage.
	 *
	 * @see pekYwv-284-p2#background
	 */
	if ( isNotCompatibleThemes( stylesheet ) ) {
		return null;
	}

	return (
		<Button href={ `https://${ siteSlug }/wp-admin/site-editor.php?theme_preview=${ stylesheet }` }>
			Live Preview
		</Button>
	);
};
