/** @format */

/**
 * External dependencies
 */

import { find } from 'lodash';
import { parse } from 'url';

/**
 * Internal dependencies
 */
import config from 'config';

const localeRegex = /^[A-Z]{2,3}$/i;
const localeWithRegionRegex = /^[A-Z]{2,3}-[A-Z]{2,3}$/i;

function getPathParts( path ) {
	// Remove trailing slash then split. If there is a trailing slash,
	// then the end of the array could contain an empty string.
	return path.replace( /\/$/, '' ).split( '/' );
}

const i18nUtils = {
	/**
	 * Checks if provided locale is a default one.
	 *
	 * @param {string} locale - locale slug (eg: 'fr')
	 * @return {boolean} true when the default locale is provided
	 */
	isDefaultLocale: function( locale ) {
		return locale === config( 'i18n_default_locale_slug' );
	},

	getLanguage: function( langSlug ) {
		let language;

		if ( localeRegex.test( langSlug ) || localeWithRegionRegex.test( langSlug ) ) {
			language =
				find( config( 'languages' ), { langSlug } ) ||
				find( config( 'languages' ), { langSlug: langSlug.split( '-' )[ 0 ] } );
		}

		return language;
	},

	/**
	 * Assuming that locale is adding at the end of path, retrieves the locale if present.
	 * @param {string} path - original path
	 * @return {string|undefined} The locale slug if present or undefined
	 */
	getLocaleFromPath: function( path ) {
		const parts = getPathParts( path );
		const locale = parts.pop();

		return 'undefined' === typeof i18nUtils.getLanguage( locale ) ? undefined : locale;
	},

	/**
	 * Adds a locale slug to the current path.
	 *
	 * Will replace existing locale slug, if present.
	 *
	 * @param {string} path - original path
	 * @param {string} locale - locale slug (eg: 'fr')
	 * @returns {string} original path with new locale slug
	 */
	addLocaleToPath: function( path, locale ) {
		const urlParts = parse( path );
		const queryString = urlParts.search || '';

		return i18nUtils.removeLocaleFromPath( urlParts.pathname ) + `/${ locale }` + queryString;
	},

	addLocaleToWpcomUrl: function( url, locale ) {
		if ( locale && locale !== 'en' ) {
			return url.replace( 'https://wordpress.com', 'https://' + locale + '.wordpress.com' );
		}

		return url;
	},

	/**
	 * Removes the trailing locale slug from the path, if it is present.
	 * '/start/en' => '/start', '/start' => '/start', '/start/flow/fr' => '/start/flow', '/start/flow' => '/start/flow'
	 * @param {string} path - original path
	 * @returns {string} original path minus locale slug
	 */
	removeLocaleFromPath: function( path ) {
		const urlParts = parse( path );
		const queryString = urlParts.search || '';
		const parts = getPathParts( urlParts.pathname );
		const locale = parts.pop();

		if ( 'undefined' === typeof i18nUtils.getLanguage( locale ) ) {
			parts.push( locale );
		}

		return parts.join( '/' ) + queryString;
	},
};

export default i18nUtils;
