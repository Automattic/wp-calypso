/** @ssr-ready **/

/**
 * External dependencies
 */
import { some, split } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'config';
import { getSiteSlug, getSiteOption, isJetpackSite } from 'state/sites/selectors';
import { getSitePurchases } from 'state/purchases/selectors';
import { isPremiumTheme, oldShowcaseUrl } from './utils';

/**
 * Returns the URL for a given theme's details sheet.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @param  {?Number} siteId Site ID to optionally use as context
 * @return {?String}        Theme details sheet URL
 */
export function getThemeDetailsUrl( state, theme, siteId ) {
	if ( ! theme ) {
		return null;
	}

	if ( isJetpackSite( state, siteId ) ) {
		return getSiteOption( state, siteId, 'admin_url' ) + 'themes.php?theme=' + theme.id;
	}

	let baseUrl = oldShowcaseUrl + theme.id;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ theme.id }`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}

/**
 * Returns the URL for a given theme's setup instructions
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @param  {?Number} siteId Site ID to optionally use as context
 * @return {?String}        Theme setup instructions URL
 */
export function getThemeSupportUrl( state, theme, siteId ) {
	if ( ! theme || ! isPremiumTheme( theme ) ) {
		return null;
	}

	const sitePart = siteId ? `/${ getSiteSlug( state, siteId ) }` : '';

	if ( config.isEnabled( 'manage/themes/details' ) ) {
		return `/theme/${ theme.id }/setup${ sitePart }`;
	}

	return `${ oldShowcaseUrl }${ sitePart }${ theme.id }/support`;
}

/**
 * Returns the URL for a given theme's support page.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @param  {?Number} siteId Site ID to optionally use as context
 * @return {?String}        Theme support page URL
 */
export function getThemeHelpUrl( state, theme, siteId ) {
	if ( ! theme ) {
		return null;
	}

	if ( isJetpackSite( state, siteId ) ) {
		return '//wordpress.org/support/theme/' + theme.id;
	}

	let baseUrl = oldShowcaseUrl + theme.id;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ theme.id }/support`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}

/**
 * Returns the URL for purchasing the given theme for the given site.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @param  {Number}  siteId Site ID for which to buy the theme
 * @return {?String}        Theme purchase URL
 */
export function getThemePurchaseUrl( state, theme, siteId ) {
	if ( ! isPremiumTheme( theme ) ) {
		return null;
	}

	return `/checkout/${ getSiteSlug( state, siteId ) }/theme:${ theme.id }`;
}

/**
 * Returns the URL for opening the customizer with the given theme on the given site.
 *
 * @param  {Object}   state  Global state tree
 * @param  {?Object}  theme  Theme object
 * @param  {?Number}  siteId Site ID to open the customizer for
 * @return {?String}         Customizer URL
 */
export function getThemeCustomizeUrl( state, theme, siteId ) {
	if ( ! siteId ) {
		return '/customize/';
	}

	if ( isJetpackSite( state, siteId ) ) {
		return getSiteOption( state, siteId, 'admin_url' ) +
			'customize.php?return=' +
			encodeURIComponent( window.location ) +
			( theme ? '&theme=' + theme.id : '' );
	}

	return '/customize/' + getSiteSlug( state, siteId ) + ( theme && theme.stylesheet ? '?theme=' + theme.stylesheet : '' );
}

/**
 * Returns the URL for signing up for a new WordPress.com account with the given theme pre-selected.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Object}  theme  Theme object
 * @return {?String}        Signup URL
 */
export function getThemeSignupUrl( state, theme ) {
	if ( ! theme ) {
		return null;
	}

	let url = '/start/with-theme?ref=calypshowcase&theme=' + theme.id;

	if ( isPremiumTheme( theme ) ) {
		url += '&premium=true';
	}

	return url;
}

/**
 * Returns the currently active theme on a given site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {Number}  siteId  Site ID
 * @return {?String}         Theme ID
 */
export function getActiveTheme( state, siteId ) {
	if ( ! siteId ) {
		return null;
	}

	const slug = getSiteOption( state, siteId, 'theme_slug' );

	if ( isJetpackSite( state, siteId ) ) {
		return slug;
	}

	// On WPCOM sites, themes slugs are prefixed with `pub/`, `premium/` etc.
	const slugParts = split( slug, '/', 2 );
	if ( slugParts.length < 2 ) {
		return null;
	}

	return slugParts[ 1 ];
}

/**
 * Returns whether the theme is currently active on the given site.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         True if the theme is active on the site
 */
export function isThemeActive( state, themeId, siteId ) {
	return getActiveTheme( state, siteId ) === themeId;
}

/**
 * Returns whether the theme has been purchased for the given site.
 *
 * Use this selector alongside with the <QuerySitePurchases /> component.
 *
 * @param  {Object}  state   Global state tree
 * @param  {String}  themeId Theme ID
 * @param  {Number}  siteId  Site ID
 * @return {Boolean}         True if the theme has been purchased for the site
 */
export function isThemePurchased( state, themeId, siteId ) {
	const sitePurchases = getSitePurchases( state, siteId );
	return some( sitePurchases, { productSlug: 'premium_theme', meta: themeId } );
}
