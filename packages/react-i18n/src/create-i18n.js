/* eslint-disable */

/**
 * External dependencies
 */
import Tannin from 'tannin';

/**
 * @typedef {{[key: string]: any}} LocaleData
 */

/**
 * Default locale data to use for Tannin domain when not otherwise provided.
 * Assumes an English plural forms expression.
 *
 * @type {LocaleData}
 */
const DEFAULT_LOCALE_DATA = {
	'': {
		plural_forms: n => ( n === 1 ? 0 : 1 ),
	},
};

/**
 * An i18n instance
 *
 * @typedef {Object} I18n
 * @property {Function} setLocaleData Merges locale data into the Tannin instance by domain. Accepts data in a
 *                                    Jed-formatted JSON object shape.
 * @property {Function} __            Retrieve the translation of text.
 * @property {Function} _x            Retrieve translated string with gettext context.
 * @property {Function} _n            Translates and retrieves the singular or plural form based on the supplied
 *                                    number.
 * @property {Function} _nx           Translates and retrieves the singular or plural form based on the supplied
 *                                    number, with gettext context.
 * @property {Function} isRTL         Check if current locale is RTL.
 */

/**
 * Create an i18n instance
 *
 * @param {LocaleData} [initialData]    Locale data configuration.
 * @param {string}     [initialDomain]  Domain for which configuration applies.
 * @return {I18n}                       I18n instance
 */
export const createI18n = ( initialData, initialDomain ) => {
	/**
	 * The underlying instance of Tannin to which exported functions interface.
	 *
	 * @type {Tannin}
	 */
	const tannin = new Tannin( {} );

	/**
	 * Merges locale data into the Tannin instance by domain. Accepts data in a
	 * Jed-formatted JSON object shape.
	 *
	 * @see http://messageformat.github.io/Jed/
	 *
	 * @param {LocaleData} [data]   Locale data configuration.
	 * @param {string}     [domain] Domain for which configuration applies.
	 */
	const setLocaleData = ( data, domain = 'default' ) => {
		tannin.data[ domain ] = {
			...DEFAULT_LOCALE_DATA,
			...tannin.data[ domain ],
			...data,
		};

		// Populate default domain configuration (supported locale date which omits
		// a plural forms expression).
		tannin.data[ domain ][ '' ] = {
			...DEFAULT_LOCALE_DATA[ '' ],
			...tannin.data[ domain ][ '' ],
		};
	};

	/**
	 * Wrapper for Tannin's `dcnpgettext`. Populates default locale data if not
	 * otherwise previously assigned.
	 *
	 * @param {string|undefined} domain   Domain to retrieve the translated text.
	 * @param {string|undefined} context  Context information for the translators.
	 * @param {string}           single   Text to translate if non-plural. Used as
	 *                                    fallback return value on a caught error.
	 * @param {string}           [plural] The text to be used if the number is
	 *                                    plural.
	 * @param {number}           [number] The number to compare against to use
	 *                                    either the singular or plural form.
	 *
	 * @return {string} The translated string.
	 */
	const dcnpgettext = ( domain = 'default', context, single, plural, number ) => {
		if ( ! tannin.data[ domain ] ) {
			setLocaleData( undefined, domain );
		}

		return tannin.dcnpgettext( domain, context, single, plural, number );
	};

	/**
	 * Retrieve the translation of text.
	 *
	 * @see https://developer.wordpress.org/reference/functions/__/
	 *
	 * @param {string} text     Text to translate.
	 * @param {string} [domain] Domain to retrieve the translated text.
	 *
	 * @return {string} Translated text.
	 */
	const __ = ( text, domain ) => {
		return dcnpgettext( domain, undefined, text );
	};

	/**
	 * Retrieve translated string with gettext context.
	 *
	 * @see https://developer.wordpress.org/reference/functions/_x/
	 *
	 * @param {string} text     Text to translate.
	 * @param {string} context  Context information for the translators.
	 * @param {string} [domain] Domain to retrieve the translated text.
	 *
	 * @return {string} Translated context string without pipe.
	 */
	const _x = ( text, context, domain ) => {
		return dcnpgettext( domain, context, text );
	};

	/**
	 * Translates and retrieves the singular or plural form based on the supplied
	 * number.
	 *
	 * @see https://developer.wordpress.org/reference/functions/_n/
	 *
	 * @param {string} single   The text to be used if the number is singular.
	 * @param {string} plural   The text to be used if the number is plural.
	 * @param {number} number   The number to compare against to use either the
	 *                          singular or plural form.
	 * @param {string} [domain] Domain to retrieve the translated text.
	 *
	 * @return {string} The translated singular or plural form.
	 */
	const _n = ( single, plural, number, domain ) => {
		return dcnpgettext( domain, undefined, single, plural, number );
	};

	/**
	 * Translates and retrieves the singular or plural form based on the supplied
	 * number, with gettext context.
	 *
	 * @see https://developer.wordpress.org/reference/functions/_nx/
	 *
	 * @param {string} single   The text to be used if the number is singular.
	 * @param {string} plural   The text to be used if the number is plural.
	 * @param {number} number   The number to compare against to use either the
	 *                          singular or plural form.
	 * @param {string} context  Context information for the translators.
	 * @param {string} [domain] Domain to retrieve the translated text.
	 *
	 * @return {string} The translated singular or plural form.
	 */
	const _nx = ( single, plural, number, context, domain ) => {
		return dcnpgettext( domain, context, single, plural, number );
	};

	/**
	 * Check if current locale is RTL.
	 *
	 * **RTL (Right To Left)** is a locale property indicating that text is written from right to left.
	 * For example, the `he` locale (for Hebrew) specifies right-to-left. Arabic (ar) is another common
	 * language written RTL. The opposite of RTL, LTR (Left To Right) is used in other languages,
	 * including English (`en`, `en-US`, `en-GB`, etc.), Spanish (`es`), and French (`fr`).
	 *
	 * @return {boolean} Whether locale is RTL.
	 */
	const isRTL = () => {
		return 'rtl' === _x( 'ltr', 'text direction' );
	};

	setLocaleData( initialData, initialDomain );

	return {
		setLocaleData,
		__,
		_x,
		_n,
		_nx,
		isRTL,
	};
};
