/**
 * External dependencies
 */
import { kebabCase, upperCase } from 'lodash';

/**
 * Generates (naively) a locale in the format ll-CC.
 * Result may or may not be valid.
 *
 * @param  {String} lang WP.com lang/locale code
 * @param  {String} countryCode GeoIP country code
 * @return {String}             Naive concat of lang + countryCode
 */
export const generateLangCcLocale = ( lang, countryCode ) => {
	return kebabCase( lang ) + '-' + upperCase( countryCode );
};
