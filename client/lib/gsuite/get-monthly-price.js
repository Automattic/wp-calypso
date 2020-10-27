/**
 * External dependencies
 */
import { isNumber, isString } from 'lodash';

/**
 * Internal dependencies
 */
import { formatPrice } from 'calypso/lib/gsuite/utils/format-price';

/**
 * Computes and formats the monthly price from the specified yearly price.
 *
 * @param {number} cost - yearly cost (e.g. '99.99')
 * @param {string} currencyCode - code of the currency (e.g. 'USD')
 * @param {string} defaultValue - value to return when the price can't be determined
 * @returns {string} - the monthly price rounded to the nearest tenth (e.g. '$8.40'), otherwise the default value
 */
export function getMonthlyPrice( cost, currencyCode, defaultValue = '-' ) {
	if ( ! isNumber( cost ) && ! isString( currencyCode ) ) {
		return defaultValue;
	}

	return formatPrice( cost / 12, currencyCode, { precision: 1 } );
}
