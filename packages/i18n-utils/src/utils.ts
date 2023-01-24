import config from '@automattic/calypso-config';
import { getUrlParts } from '@automattic/calypso-url';
import languages, { Language, SubLanguage } from '@automattic/languages';
import i18n, { getLocaleSlug } from 'i18n-calypso';
import { find, map, pickBy, includes } from 'lodash';

/**
 * a locale can consist of three component
 * aa: language code
 * -bb: regional code
 * _cc: variant suffix
 * while the language code is mandatory, the other two are optional.
 */
const localeRegex = /^[A-Z]{2,3}(-[A-Z]{2,3})?(_[A-Z]{2,6})?$/i;

export function getPathParts( path: string ) {
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
export function isDefaultLocale( locale: string | null ) {
	return locale === config( 'i18n_default_locale_slug' );
}

/**
 * Checks if provided locale has a parentLangSlug and is therefore a locale variant
 *
 * @param {string} locale - locale slug (eg: 'fr')
 * @returns {boolean} true when the locale has a parentLangSlug
 */
export function isLocaleVariant( locale: string ) {
	if ( typeof locale !== 'string' ) {
		return false;
	}
	const language = getLanguage( locale ) as SubLanguage;
	return !! language && typeof language.parentLangSlug === 'string';
}

export function isLocaleRtl( locale: string ) {
	if ( typeof locale !== 'string' ) {
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
export function canBeTranslated( locale: string ) {
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
export function translationExists( phrase: string ) {
	const localeSlug = typeof getLocaleSlug === 'function' ? getLocaleSlug() : 'en';
	return isDefaultLocale( localeSlug ) || i18n.hasTranslation( phrase );
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
 * Map provided language slug to supported slug if applicable.
 *
 * @param {string} langSlug Locale slug for the language
 * @returns {string} Mapped language slug
 */
export function getMappedLanguageSlug( langSlug: string | undefined ) {
	// See pxLjZ-6UQ-p2 for details.
	if ( langSlug === 'no' ) {
		return 'nb';
	}

	return langSlug;
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
 * @returns {Object | undefined} An object containing the locale data or undefined.
 */
export function getLanguage( langSlug: string | undefined ): Language | undefined {
	langSlug = getMappedLanguageSlug( langSlug );
	if ( langSlug && localeRegex.test( langSlug ) ) {
		// Find for the langSlug first. If we can't find it, split it and find its parent slug.
		// Please see the comment above `localeRegex` to see why we can split by - or _ and find the parent slug.
		return ( find( languages, { langSlug } ) ||
			find( languages, { langSlug: langSlug.split( /[-_]/ )[ 0 ] } ) ) as Language | undefined;
	}

	return undefined;
}

/**
 * Assuming that locale is adding at the end of path, retrieves the locale if present.
 *
 * @param {string} path - original path
 * @returns {string|undefined} The locale slug if present or undefined
 */
export function getLocaleFromPath( path: string ) {
	const urlParts = getUrlParts( path );
	const locale = getPathParts( urlParts.pathname ).pop();

	return 'undefined' === typeof getLanguage( locale ) ? undefined : locale;
}

/**
 * Adds a locale slug to the current path.
 *
 * Will replace existing locale slug, if present.
 *
 * @param path - original path
 * @param locale - locale slug (eg: 'fr')
 * @returns original path with new locale slug
 */
export function addLocaleToPath( path: string, locale: string ) {
	const urlParts = getUrlParts( path );
	const queryString = urlParts.search || '';

	return removeLocaleFromPath( urlParts.pathname ) + `/${ locale }` + queryString;
}

/**
 * Removes the trailing locale slug from the path, if it is present.
 * '/start/en' => '/start', '/start' => '/start', '/start/flow/fr' => '/start/flow', '/start/flow' => '/start/flow'
 *
 * @param  path - original path
 * @returns original path minus locale slug
 */
export function removeLocaleFromPath( path: string ): string {
	const urlParts = getUrlParts( path );
	const queryString = urlParts.search || '';
	const parts = getPathParts( urlParts.pathname );
	const locale = parts.pop();

	if ( 'undefined' === typeof getLanguage( locale ) ) {
		parts.push( locale as string );
	}

	return parts.join( '/' ) + queryString;
}

/**
 * Filter out unexpected values from the given language revisions object.
 *
 * @param {Object} languageRevisions A candidate language revisions object for filtering.
 * @returns {Object} A valid language revisions object derived from the given one.
 */
export function filterLanguageRevisions( languageRevisions: Record< string, string > ) {
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
 * @param locale Locale slug
 * @returns true when provided magnificent non-english locale.
 */
export function isMagnificentLocale( locale: string ): boolean {
	return ( config( 'magnificent_non_en_locales' ) as string[] ).includes( locale );
}

/**
 * Checks if provided locale is translated incompletely (is missing essential translations).
 *
 * @param   {string}  locale Locale slug
 * @returns {boolean} Whether provided locale is flagged as translated incompletely.
 */
export function isTranslatedIncompletely( locale: string ) {
	return getLanguage( locale )?.isTranslatedIncompletely === true;
}
