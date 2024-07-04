import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { getQueryArg } from '@wordpress/url';

export const WOOCOMMERCE_THEME = 'woocommerce';
export const PREMIUM_THEME = 'premium';
export const PERSONAL_THEME = 'personal';

/**
 * Get unlock API from Gutenberg.
 * Sometimes Gutenberg doesn't allow you to re-register the module and throws an error.
 */
export const getUnlock = () => {
	/**
	 * Sometimes Gutenberg doesn't allow you to re-register the module and throws an error.
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let unlock: ( object: any ) => any | undefined;
	try {
		unlock = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			( window as any ).wpcomGutenberg?.pluginVersion?.startsWith( 'v18.7' )
				? 'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.'
				: 'I know using unstable features means my theme or plugin will inevitably break in the next version of WordPress.',
			'@wordpress/edit-site'
		).unlock;
		return unlock;
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Error: Unable to get the unlock api. Reason: %s', error );
		return undefined;
	}
};

/**
 * Return true if the user is currently previewing a theme.
 * FIXME: This is copied from Gutenberg; we should be creating a selector for the `core/edit-site` store.
 * @see https://github.com/WordPress/gutenberg/blob/053c8f733c85d80c891fa308b071b9a18e5194e9/packages/edit-site/src/utils/is-previewing-theme.js#L6
 * @returns {boolean} isPreviewingTheme
 */

export function isPreviewingTheme() {
	return getQueryArg( window.location.href, 'wp_theme_preview' ) !== undefined;
}
/**
 * Return the theme slug if the user is currently previewing a theme.
 * FIXME: This is copied from Gutenberg; we should be creating a selector for the `core/edit-site` store.
 * @see https://github.com/WordPress/gutenberg/blob/053c8f733c85d80c891fa308b071b9a18e5194e9/packages/edit-site/src/utils/is-previewing-theme.js#L6
 * @returns {string|null} currentlyPreviewingTheme
 */

export function currentlyPreviewingTheme() {
	if ( isPreviewingTheme() ) {
		return getQueryArg( window.location.href, 'wp_theme_preview' ) as string;
	}
	return undefined;
}
