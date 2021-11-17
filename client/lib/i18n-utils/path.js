import { getUrlParts } from '@automattic/calypso-url';
import { getLanguageSlugs, getLanguage } from '@automattic/languages';

/**
 * Return a specifier for page.js/Express route param that enumerates all supported languages.
 *
 * @param {string} name of the parameter. By default it's `lang`, some routes use `locale`.
 * @param {boolean} optional whether to put the `?` character at the end, making the param optional
 * @returns {string} Router param specifier that looks like `:lang(cs|de|fr|pl)`
 */
export function getLanguageRouteParam( name = 'lang', optional = true ) {
	return `:${ name }(${ getLanguageSlugs().join( '|' ) })${ optional ? '?' : '' }`;
}

function getPathParts( path ) {
	// Remove trailing slash then split. If there is a trailing slash,
	// then the end of the array could contain an empty string.
	return path.replace( /\/$/, '' ).split( '/' );
}

/**
 * Assuming that locale is adding at the end of path, retrieves the locale if present.
 *
 * @param {string} path - original path
 * @returns {string|undefined} The locale slug if present or undefined
 */
export function getLocaleFromPath( path ) {
	const urlParts = getUrlParts( path );
	const locale = getPathParts( urlParts.pathname ).pop();

	return getLanguage( locale ) ? locale : undefined;
}

/**
 * Removes the trailing locale slug from the path, if it is present.
 * '/start/en' => '/start', '/start' => '/start', '/start/flow/fr' => '/start/flow', '/start/flow' => '/start/flow'
 *
 * @param {string} path - original path
 * @returns {string} original path minus locale slug
 */
export function removeLocaleFromPath( path ) {
	const urlParts = getUrlParts( path );
	const queryString = urlParts.search || '';
	const parts = getPathParts( urlParts.pathname );
	const locale = parts.pop();

	if ( 'undefined' === typeof getLanguage( locale ) ) {
		parts.push( locale );
	}

	return parts.join( '/' ) + queryString;
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
	const urlParts = getUrlParts( path );
	const queryString = urlParts.search || '';

	return removeLocaleFromPath( urlParts.pathname ) + `/${ locale }` + queryString;
}
