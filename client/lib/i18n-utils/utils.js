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

/**
 * Checks if provided locale is a default one.
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @return {boolean} true when the default locale is provided
 */
export function isDefaultLocale( locale ) {
	return locale === config( 'i18n_default_locale_slug' );
}

export function getLanguage( langSlug ) {
	let language;

	if ( localeRegex.test( langSlug ) || localeWithRegionRegex.test( langSlug ) ) {
		language =
			find( config( 'languages' ), { langSlug } ) ||
			find( config( 'languages' ), { langSlug: langSlug.split( '-' )[ 0 ] } );
	}

	return language;
}

/**
 * Assuming that locale is adding at the end of path, retrieves the locale if present.
 * @param {string} path - original path
 * @return {string|undefined} The locale slug if present or undefined
 */
export function getLocaleFromPath( path ) {
	const urlParts = parse( path );
	const locale = getPathParts( urlParts.pathname ).pop();

	return 'undefined' === typeof getLanguage( locale ) ? undefined : locale;
}

/**
 * Adds a locale slug to the current path.
 *
 * Will replace existing locale slug, if present.
 *
 * @param {string} path - original path
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {string} original path with new locale slug
 */
export function addLocaleToPath( path, locale ) {
	const urlParts = parse( path );
	const queryString = urlParts.search || '';

	return removeLocaleFromPath( urlParts.pathname ) + `/${ locale }` + queryString;
}

export function addLocaleToWpcomUrl( url, locale ) {
	if ( locale && locale !== 'en' ) {
		return url.replace( 'https://wordpress.com', 'https://' + locale + '.wordpress.com' );
	}

	return url;
}

/**
 * Removes the trailing locale slug from the path, if it is present.
 * '/start/en' => '/start', '/start' => '/start', '/start/flow/fr' => '/start/flow', '/start/flow' => '/start/flow'
 * @param {string} path - original path
 * @returns {string} original path minus locale slug
 */
export function removeLocaleFromPath( path ) {
	const urlParts = parse( path );
	const queryString = urlParts.search || '';
	const parts = getPathParts( urlParts.pathname );
	const locale = parts.pop();

	if ( 'undefined' === typeof getLanguage( locale ) ) {
		parts.push( locale );
	}

	return parts.join( '/' ) + queryString;
}
