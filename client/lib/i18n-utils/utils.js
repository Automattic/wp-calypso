import config from '@automattic/calypso-config';
import { localizeUrl as _localizeUrl } from '@automattic/i18n-utils';
import i18n, { getLocaleSlug } from 'i18n-calypso';

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

export function localizeUrl( fullUrl, locale ) {
	const localeSlug = locale || ( typeof getLocaleSlug === 'function' ? getLocaleSlug() : 'en' );
	return _localizeUrl( fullUrl, localeSlug );
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
