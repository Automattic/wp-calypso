/**
 * External dependencies
 */
import formatCurrency from '@automattic/format-currency';

/**
 * Applies a precision to the cost
 *
 * @param {number} cost - cost
 * @param {number} precision - precision to apply to cost
 * @returns {string} - Returns price with applied precision
 */
function applyPrecision( cost, precision ) {
	const exponent = Math.pow( 10, precision );
	return Math.ceil( cost * exponent ) / exponent;
}

/**
 * Formats price given cost and currency
 *
 * @param {number} cost - cost
 * @param {string} currencyCode - currency code to format with
 * @param {object} options - options containing precision
 * @returns {string} - Returns a formatted price
 */
export function formatPrice( cost, currencyCode, options = {} ) {
	if ( undefined !== options.precision ) {
		cost = applyPrecision( cost, options.precision );
	}

	return formatCurrency( cost, currencyCode, cost % 1 > 0 ? {} : { precision: 0 } );
}
