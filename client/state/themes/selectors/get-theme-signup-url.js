import { doesThemeBundleSoftwareSet } from 'calypso/state/themes/selectors/does-theme-bundle-software-set';
import { isExternallyManagedTheme } from 'calypso/state/themes/selectors/is-externally-managed-theme';
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';
import 'calypso/state/themes/init';
import { isWpcomTheme } from 'calypso/state/themes/selectors/is-wpcom-theme';
import { isWporgTheme } from 'calypso/state/themes/selectors/is-wporg-theme';

/**
 * Returns the URL for signing up for a new WordPress.com account with the given theme pre-selected.
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {?string}         Signup URL
 */
export function getThemeSignupUrl( state, themeId ) {
	if ( ! themeId ) {
		return null;
	}

	let url = '/start/with-theme?ref=calypshowcase&theme=' + themeId;

	if ( isThemePremium( state, themeId ) ) {
		url += '&premium=true';
	}

	const themeType = getThemeTypeUrlParameter( state, themeId );
	url += `&theme_type=${ themeType }`;

	return url;
}

/**
 * Get the theme type url we pass to the with-theme flow.
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @returns {string}         theme type
 */
function getThemeTypeUrlParameter( state, themeId ) {
	/**
	 * Is Marketplace theme.
	 */
	if ( isExternallyManagedTheme( state, themeId ) ) {
		return 'managed-externally';
	}

	/**
	 * Is WooCommerce theme.
	 */
	if ( doesThemeBundleSoftwareSet( state, themeId ) ) {
		return 'woocommerce';
	}

	/**
	 * Is premium theme.
	 */
	if ( isThemePremium( state, themeId ) ) {
		return 'premium';
	}

	if ( isWpcomTheme( state, themeId ) && ! isThemePremium( state, themeId ) ) {
		return 'free';
	}

	/**
	 * Is .ORG theme.
	 */
	if ( isWporgTheme( state, themeId ) ) {
		return 'dot-org';
	}

	/**
	 * Unhandled type, fallback to free.
	 */
	return 'free';
}
