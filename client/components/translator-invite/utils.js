/**
 * External dependencies
 */
import { startsWith } from 'lodash';

/**
 * Internal dependencies
 */
import config from 'calypso/config';
import { getLanguage, getLocaleFromPath } from 'calypso/lib/i18n-utils';

/**
 * Module variables
 */
const defaultLanguageSlug = config( 'i18n_default_locale_slug' );

/**
 * Checks a locale against the default. Returns true if the
 * locale's prefix matches the default locale. E.g., a locale of en-AU
 * starts with 'en', the defaultLanguageSlug.
 *
 * @param {string} locale An language slug
 * @returns {boolean} The locale slug of the language, if any found.
 */
export function isDefaultLocale( locale ) {
	return startsWith( locale, defaultLanguageSlug );
}

/**
 * Checks incoming locale then urlPath for a valid non-default locale.
 * If no matching locale exists, we look in the user's browser preferences.
 *
 * @param {string} locale The language slug of an existing locale
 * @param {string} urlPath Current path
 * @returns {string|null} The locale slug of the language, if any found.
 */
export function getCurrentNonDefaultLocale( locale, urlPath ) {
	// First try the locale passed as props.
	let languageLocale = ! isDefaultLocale( locale ) ? locale : null;

	// Then the locale in the path, if any.
	if ( ! languageLocale && urlPath ) {
		languageLocale = getLocaleFromPath( urlPath );
		languageLocale = ! isDefaultLocale( languageLocale ) ? languageLocale : null;
	}

	// Then navigator.languages.
	if ( ! languageLocale && typeof navigator === 'object' && 'languages' in navigator ) {
		for ( const langSlug of navigator.languages ) {
			const language = getLanguage( langSlug.toLowerCase() );
			if ( language && ! isDefaultLocale( language.langSlug ) ) {
				languageLocale = language.langSlug;
				break;
			}
		}
	}

	if ( languageLocale ) {
		return languageLocale;
	}

	return null;
}
