/** @format */
/**
 * External dependencies
 */
import { find, isString } from 'lodash';
import { parse } from 'url';

/**
 * Internal dependencies
 */
import config from 'config';

/**
 * a locale can consist of three component
 * aa: language code
 * -bb: regional code
 * _cc: variant suffix
 * while the language code is mandatory, the other two are optional.
 */
const localeRegex = /^[A-Z]{2,3}(-[A-Z]{2,3})?(_[A-Z]{2,6})?$/i;

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

/**
 * Checks if provided locale has a parentLangSlug and is therefore a locale variant
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @return {boolean} true when the locale has a parentLangSlug
 */
export function isLocaleVariant( locale ) {
	if ( ! isString( locale ) ) {
		return false;
	}
	const language = getLanguage( locale );
	return !! language && isString( language.parentLangSlug );
}

/**
 * Matches and returns language from config.languages based on the given localeSlug and localeVariant
 * @param  {String} localeSlug locale slug of the language to match
 * @param  {String?} localeVariant local variant of the language to match. It takes precedence if exists.
 * @return {Object|undefined} An object containing the locale data or undefined.
 */
export function getLanguage( localeSlug, localeVariant = null ) {
	// if a localeVariant is given, we should use it. Otherwise, use localeSlug
	const langSlug = localeVariant || localeSlug;

	if ( localeRegex.test( langSlug ) ) {
		// Find for the langSlug first. If we can't find it, split it and find its parent slug.
		// Please see the comment above `localeRegex` to see why we can split by - or _ and find the parent slug.
		return (
			find( config( 'languages' ), { langSlug } ) ||
			find( config( 'languages' ), { langSlug: langSlug.split( /[-_]/ )[ 0 ] } )
		);
	}

	return undefined;
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
