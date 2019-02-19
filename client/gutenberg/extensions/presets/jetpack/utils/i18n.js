/**
 * This contains a set of wrappers for all the @wordpress/i18n localization functions.
 * Each of the wrappers has the same signature like the original corresponding function,
 * but without the textdomain at the end.
 *
 * The wrappers are necessary because we'd like to reuse i18n-calypso provided translations
 * for our Gutenberg blocks, but we'd also like to not include i18n-calypso in block bundles.
 * Instead, we use @wordpress/i18n, but it requires a textdomain in order to know where
 * to look for the translations.
 *
 * In the same time, we use those blocks in Jetpack, and in order to be able to index the
 * translations there without issues, the localization function calls in the source code
 * must not contain a textdomain.
 */

/**
 * External dependencies
 */
import { __ as wpI18n__, _n as wpI18n_n, _x as wpI18n_x, _nx as wpI18n_nx } from '@wordpress/i18n';

/**
 * Module variables
 */
const TEXTDOMAIN = 'jetpack';

/**
 * Add a textdomain to arguments of a localization function call.
 *
 * @param {Array} originalArgs Arguments that the localization function was called with.
 *
 * @return {Array} Arguments, with textdomain added as the last one.
 */
const addTextdomain = originalArgs => {
	const args = [ ...originalArgs ];
	args.push( TEXTDOMAIN );
	return args;
};

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
export function __() {
	return wpI18n__( ...addTextdomain( arguments ) );
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
export function _n() {
	return wpI18n_n( ...addTextdomain( arguments ) );
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
export function _x() {
	return wpI18n_x( ...addTextdomain( arguments ) );
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
export function _nx() {
	return wpI18n_nx( ...addTextdomain( arguments ) );
}
