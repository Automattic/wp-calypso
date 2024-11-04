import { getQueryArg } from '@wordpress/url';

export const WOOCOMMERCE_THEME = 'woocommerce';
export const PREMIUM_THEME = 'premium';
export const PERSONAL_THEME = 'personal';

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
