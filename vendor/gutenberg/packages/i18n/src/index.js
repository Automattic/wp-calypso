/**
 * External dependencies
 */
import Jed from 'jed';
import memoize from 'memize';

let i18n;

/**
 * Log to console, once per message; or more precisely, per referentially equal
 * argument set. Because Jed throws errors, we log these to the console instead
 * to avoid crashing the application.
 *
 * @param {...*} args Arguments to pass to `console.error`
 */
const logErrorOnce = memoize( console.error ); // eslint-disable-line no-console

/**
 * Merges locale data into the Jed instance by domain. Creates a new Jed
 * instance if one has not yet been assigned.
 *
 * @see http://messageformat.github.io/Jed/
 *
 * @param {?Object} localeData Locale data configuration.
 * @param {?string} domain     Domain for which configuration applies.
 */
export function setLocaleData( localeData = { '': {} }, domain = 'default' ) {
	if ( ! i18n ) {
		i18n = new Jed( {
			domain: 'default',
			locale_data: {
				default: {},
			},
		} );
	}

	i18n.options.locale_data[ domain ] = Object.assign(
		{},
		i18n.options.locale_data[ domain ],
		localeData
	);
}

/**
 * Returns the current Jed instance, initializing with a default configuration
 * if not already assigned.
 *
 * @return {Jed} Jed instance.
 */
export function getI18n() {
	if ( ! i18n ) {
		setLocaleData();
	}

	return i18n;
}

/**
 * Wrapper for Jed's `dcnpgettext`, its most qualified function. Absorbs errors
 * which are thrown as the result of invalid translation.
 *
 * @param {?string} domain  Domain to retrieve the translated text.
 * @param {?string} context Context information for the translators.
 * @param {string}  single  Text to translate if non-plural. Used as fallback
 *                          return value on a caught error.
 * @param {?string} plural  The text to be used if the number is plural.
 * @param {?number} number  The number to compare against to use either the
 *                          singular or plural form.
 *
 * @return {string} The translated string.
 */
export const dcnpgettext = memoize( ( domain = 'default', context, single, plural, number ) => {
	try {
		return getI18n().dcnpgettext( domain, context, single, plural, number );
	} catch ( error ) {
		logErrorOnce( 'Jed localization error: \n\n' + error.toString() );

		return single;
	}
} );

/**
 * Retrieve the translation of text.
 *
 * @see https://developer.wordpress.org/reference/functions/__/
 *
 * @param {string}  text   Text to translate.
 * @param {?string} domain Domain to retrieve the translated text.
 *
 * @return {string} Translated text.
 */
export function __( text, domain ) {
	return dcnpgettext( domain, undefined, text );
}

/**
 * Retrieve translated string with gettext context.
 *
 * @see https://developer.wordpress.org/reference/functions/_x/
 *
 * @param {string}  text    Text to translate.
 * @param {string}  context Context information for the translators.
 * @param {?string} domain  Domain to retrieve the translated text.
 *
 * @return {string} Translated context string without pipe.
 */
export function _x( text, context, domain ) {
	return dcnpgettext( domain, context, text );
}

/**
 * Translates and retrieves the singular or plural form based on the supplied
 * number.
 *
 * @see https://developer.wordpress.org/reference/functions/_n/
 *
 * @param {string}  single The text to be used if the number is singular.
 * @param {string}  plural The text to be used if the number is plural.
 * @param {number}  number The number to compare against to use either the
 *                         singular or plural form.
 * @param {?string} domain Domain to retrieve the translated text.
 *
 * @return {string} The translated singular or plural form.
 */
export function _n( single, plural, number, domain ) {
	return dcnpgettext( domain, undefined, single, plural, number );
}

/**
 * Translates and retrieves the singular or plural form based on the supplied
 * number, with gettext context.
 *
 * @see https://developer.wordpress.org/reference/functions/_nx/
 *
 * @param {string}  single  The text to be used if the number is singular.
 * @param {string}  plural  The text to be used if the number is plural.
 * @param {number}  number  The number to compare against to use either the
 *                          singular or plural form.
 * @param {string}  context Context information for the translators.
 * @param {?string} domain  Domain to retrieve the translated text.
 *
 * @return {string} The translated singular or plural form.
 */
export function _nx( single, plural, number, context, domain ) {
	return dcnpgettext( domain, context, single, plural, number );
}

/**
 * Returns a formatted string. If an error occurs in applying the format, the
 * original format string is returned.
 *
 * @param {string}   format  The format of the string to generate.
 * @param {string[]} ...args Arguments to apply to the format.
 *
 * @see http://www.diveintojavascript.com/projects/javascript-sprintf
 *
 * @return {string} The formatted string.
 */
export function sprintf( format, ...args ) {
	try {
		return Jed.sprintf( format, ...args );
	} catch ( error ) {
		logErrorOnce( 'Jed sprintf error: \n\n' + error.toString() );

		return format;
	}
}
