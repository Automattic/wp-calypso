/**
 * External dependencies
 */
import { find, isString, map, pickBy, includes } from 'lodash';
import i18n, { getLocaleSlug } from 'i18n-calypso';
import { localizeUrl as _localizeUrl } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import languages from '@automattic/languages';
import { getUrlParts } from 'calypso/lib/url/url-parts';

/**
 * a locale can consist of three component
 * aa: language code
 * -bb: regional code
 * _cc: variant suffix
 * while the language code is mandatory, the other two are optional.
 */
const localeRegex = /^[A-Z]{2,3}(-[A-Z]{2,3})?(_[A-Z]{2,6})?$/i;

export function getPathParts( path ) {
	// Remove trailing slash then split. If there is a trailing slash,
	// then the end of the array could contain an empty string.
	return path.replace( /\/$/, '' ).split( '/' );
}

/**
 * Checks if provided locale is a default one.
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {boolean} true when the default locale is provided
 */
export function isDefaultLocale( locale ) {
	return locale === config( 'i18n_default_locale_slug' );
}

/**
 * Checks if provided locale has a parentLangSlug and is therefore a locale variant
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {boolean} true when the locale has a parentLangSlug
 */
export function isLocaleVariant( locale ) {
	if ( ! isString( locale ) ) {
		return false;
	}
	const language = getLanguage( locale );
	return !! language && isString( language.parentLangSlug );
}

export function isLocaleRtl( locale ) {
	if ( ! isString( locale ) ) {
		return null;
	}
	const language = getLanguage( locale );
	if ( ! language ) {
		return null;
	}

	return Boolean( language.rtl );
}

/**
 * Checks against a list of locales that don't have any GP translation sets
 * A 'translation set' refers to a collection of strings to be translated see:
 * https://glotpress.blog/the-manual/translation-sets/
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {boolean} true when the locale is NOT a member of the exception list
 */
export function canBeTranslated( locale ) {
	return [ 'en', 'sr_latin' ].indexOf( locale ) === -1;
}

/**
 * To be used with the same parameters as i18n-calpyso's translate():
 * Check whether the user would be exposed to text not in their language.
 *
 * Since the text is in English, this is always true in that case. Otherwise
 * We check whether a translation was provided for this text.
 *
 * @returns {boolean} true when a user would see text they can read.
 */
export function translationExists() {
	const localeSlug = typeof getLocaleSlug === 'function' ? getLocaleSlug() : 'en';
	return isDefaultLocale( localeSlug ) || i18n.hasTranslation( ...arguments );
}

/**
 * Return a list of all supported language slugs
 *
 * @returns {Array} A list of all supported language slugs
 */
export function getLanguageSlugs() {
	return map( languages, 'langSlug' );
}

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

/**
 * Matches and returns language from config.languages based on the given localeSlug
 *
 * @param   {string} langSlug locale slug of the language to match
 * @returns {object|undefined} An object containing the locale data or undefined.
 */
export function getLanguage( langSlug ) {
	if ( localeRegex.test( langSlug ) ) {
		// Find for the langSlug first. If we can't find it, split it and find its parent slug.
		// Please see the comment above `localeRegex` to see why we can split by - or _ and find the parent slug.
		return (
			find( languages, { langSlug } ) ||
			find( languages, { langSlug: langSlug.split( /[-_]/ )[ 0 ] } )
		);
	}

	return undefined;
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
	const urlParts = getUrlParts( path );
	const queryString = urlParts.search || '';

	return removeLocaleFromPath( urlParts.pathname ) + `/${ locale }` + queryString;
}

export function localizeUrl( fullUrl, locale ) {
	const localeSlug = locale || ( typeof getLocaleSlug === 'function' ? getLocaleSlug() : 'en' );
	return _localizeUrl( fullUrl, localeSlug );
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
 * Filter out unexpected values from the given language revisions object.
 *
 * @param {object} languageRevisions A candidate language revisions object for filtering.
 *
 * @returns {object} A valid language revisions object derived from the given one.
 */
export function filterLanguageRevisions( languageRevisions ) {
	const langSlugs = getLanguageSlugs();

	// Since there is no strong guarantee that the passed-in revisions map will have the identical set of languages as we define in calypso,
	// simply filtering against what we have here should be sufficient.
	return pickBy( languageRevisions, ( revision, slug ) => {
		if ( typeof revision !== 'number' ) {
			return false;
		}

		if ( ! includes( langSlugs, slug ) ) {
			return false;
		}

		return true;
	} );
}

/**
 * Checks if provided locale is one of the magnificenet non-english locales.
 *
 * @param   {string}  locale Locale slug
 * @returns {boolean} true when provided magnificent non-english locale.
 */
export function isMagnificentLocale( locale ) {
	return config( 'magnificent_non_en_locales' ).includes( locale );
}

/**
 * Checks if provided locale is translated incompletely (is missing essential translations).
 *
 * @param   {string}  locale Locale slug
 * @returns {boolean} Whether provided locale is flagged as translated incompletely.
 */
export function isTranslatedIncompletely( locale ) {
	return getLanguage( locale )?.isTranslatedIncompletely === true;
}
