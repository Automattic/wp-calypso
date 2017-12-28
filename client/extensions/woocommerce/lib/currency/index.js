/** @format */
/**
 * External dependencies
 */
import { getCurrencyDefaults } from 'client/lib/format-currency';

/**
 * Get the rounded decimal value of a number at the precision used for a given currency.
 * This is a work-around for fraction-cents, meant to be used like `wc_format_decimal`
 *
 * @param {Number|String} number A floating point number (or integer), or string that converts to a number
 * @param {String} currency A 3-character currency label, e.g. 'GBP' – see `getCurrencyDefaults`
 * @return {Number} The original number rounded to a decimal point
 */
export function getCurrencyFormatDecimal( number, currency = 'USD' ) {
	const { precision } = getCurrencyDefaults( currency );
	if ( 'number' !== typeof number ) {
		number = parseFloat( number );
	}
	if ( isNaN( number ) ) {
		return 0;
	}
	return Math.round( number * Math.pow( 10, precision ) ) / Math.pow( 10, precision );
}

/**
 * Get the string representation of a floating point number to the precision used by a given currency.
 * This is different from `formatCurrency` by not returning the currency symbol.
 *
 * @param {Number|String} number A floating point number (or integer), or string that converts to a number
 * @param {String} currency A 3-character currency label, e.g. 'GBP' – see `getCurrencyDefaults`
 * @return {String} The original number rounded to a decimal point
 */
export function getCurrencyFormatString( number, currency = 'USD' ) {
	const { precision } = getCurrencyDefaults( currency );
	if ( 'number' !== typeof number ) {
		number = parseFloat( number );
	}
	if ( isNaN( number ) ) {
		return '';
	}
	return number.toFixed( precision );
}
