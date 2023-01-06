import { doesCurrencyExist, getCurrencyDefaults } from './currencies';
import numberFormat from './number-format';
import type { FormatCurrencyOptions, CurrencyObject } from './types';

export { getCurrencyDefaults };

export { CURRENCIES } from './currencies';

export * from './types';

/**
 * Formats money with a given currency code.
 *
 * The currency will define the properties to use for this formatting, but
 * those properties can be overridden using the options. Be careful when doing
 * this.
 *
 * For currencies that include decimals, this will always return the amount
 * with decimals included, even if those decimals are zeros. To exclude the
 * zeros, use the `stripZeros` option. For example, the function will normally
 * format `10.00` in `USD` as `$10.00` but when this option is true, it will
 * return `$10` instead.
 *
 * Since rounding errors are common in floating point math, sometimes a price
 * is provided as an integer in the smallest unit of a currency (eg: cents in
 * USD or yen in JPY). Set the `isSmallestUnit` to change the function to
 * operate on integer numbers instead. If this option is not set or false, the
 * function will format the amount `1025` in `USD` as `$1,025.00`, but when the
 * option is true, it will return `$10.25` instead.
 *
 * If the number is NaN, it will be treated as 0.
 *
 * If the currency code is not known, this will assume a default currency
 * similar to USD.
 *
 * If `isSmallestUnit` is set and the number is not an integer, it will be
 * rounded to an integer.
 *
 * @param      {number}                   number     number to format; assumed to be a float unless isSmallestUnit is set.
 * @param      {string}                   code       currency code e.g. 'USD'
 * @param      {FormatCurrencyOptions}    options    options object
 * @returns    {string}                  A formatted string.
 */
export function formatCurrency(
	number: number,
	code: string,
	options: FormatCurrencyOptions = {}
): string {
	if ( ! doesCurrencyExist( code ) ) {
		// eslint-disable-next-line no-console
		console.warn( `formatCurrency was called with an unknown currency "${ code }"` );
	}
	const currencyDefaults = getCurrencyDefaults( code );
	if ( isNaN( number ) ) {
		// eslint-disable-next-line no-console
		console.warn( 'formatCurrency was called with NaN' );
		number = 0;
	}
	const { decimal, grouping, precision, symbol, isSmallestUnit } = {
		...currencyDefaults,
		...options,
	};
	const sign = number < 0 ? '-' : '';
	if ( isSmallestUnit ) {
		if ( ! Number.isInteger( number ) ) {
			// eslint-disable-next-line no-console
			console.warn(
				'formatCurrency was called with isSmallestUnit and a float which will be rounded',
				number
			);
			number = Math.round( number );
		}
		number = convertPriceForSmallestUnit( number, precision );
	}
	let value = numberFormat( Math.abs( number ), precision, decimal, grouping );

	if ( options.stripZeros ) {
		value = stripZeros( value, decimal );
	}

	return `${ sign }${ symbol }${ value }`;
}

/**
 * Returns a formatted price object.
 *
 * The currency will define the properties to use for this formatting, but
 * those properties can be overridden using the options. Be careful when doing
 * this.
 *
 * For currencies that include decimals, this will always return the amount
 * with decimals included, even if those decimals are zeros. To exclude the
 * zeros, use the `stripZeros` option. For example, the function will normally
 * format `10.00` in `USD` as `$10.00` but when this option is true, it will
 * return `$10` instead.
 *
 * Since rounding errors are common in floating point math, sometimes a price
 * is provided as an integer in the smallest unit of a currency (eg: cents in
 * USD or yen in JPY). Set the `isSmallestUnit` to change the function to
 * operate on integer numbers instead. If this option is not set or false, the
 * function will format the amount `1025` in `USD` as `$1,025.00`, but when the
 * option is true, it will return `$10.25` instead.
 *
 * Note that the `integer` return value of this function is not a number, but a
 * locale-formatted string which may include symbols like spaces, commas, or
 * periods as group separators. Similarly, the `fraction` property is a string
 * that contains the decimal separator.
 *
 * If the number is NaN, it will be treated as 0.
 *
 * If the currency code is not known, this will assume a default currency
 * similar to USD.
 *
 * If `isSmallestUnit` is set and the number is not an integer, it will be
 * rounded to an integer.
 *
 * @param      {number}                   number     number to format; assumed to be a float unless isSmallestUnit is set.
 * @param      {string}                   code       currency code e.g. 'USD'
 * @param      {FormatCurrencyOptions}    options    options object
 * @returns    {CurrencyObject}          A formatted string e.g. { symbol:'$', integer: '$99', fraction: '.99', sign: '-' }
 */
export function getCurrencyObject(
	number: number,
	code: string,
	options: FormatCurrencyOptions = {}
): CurrencyObject {
	if ( ! doesCurrencyExist( code ) ) {
		// eslint-disable-next-line no-console
		console.warn( `getCurrencyObject was called with an unknown currency "${ code }"` );
	}
	const currencyDefaults = getCurrencyDefaults( code );
	if ( isNaN( number ) ) {
		// eslint-disable-next-line no-console
		console.warn( 'getCurrencyObject was called with NaN' );
		number = 0;
	}
	const { decimal, grouping, precision, symbol, isSmallestUnit } = {
		...currencyDefaults,
		...options,
	};
	const sign = number < 0 ? '-' : '';
	if ( isSmallestUnit ) {
		if ( ! Number.isInteger( number ) ) {
			// eslint-disable-next-line no-console
			console.warn(
				'getCurrencyObject was called with isSmallestUnit and a float which will be rounded',
				number
			);
			number = Math.round( number );
		}
		number = convertPriceForSmallestUnit( number, precision );
	}
	const absNumber = Math.abs( number );
	const rawInteger = Math.floor( absNumber );
	const integer = numberFormat( absNumber, precision, decimal, grouping ).split( decimal )[ 0 ];
	const fraction =
		precision > 0
			? numberFormat( absNumber - rawInteger, precision, decimal, grouping ).slice( 1 )
			: '';
	return {
		sign,
		symbol,
		integer,
		fraction,
	};
}

/**
 * Remove trailing zero cents
 *
 * @param {string}  number  formatted number
 * @param {string}  decimal decimal symbol
 * @returns {string}
 */

function stripZeros( number: string, decimal: string ): string {
	const regex = new RegExp( `\\${ decimal }0+$` );
	return number.replace( regex, '' );
}

function convertPriceForSmallestUnit( price: number, precision: number ): number {
	return price / getSmallestUnitDivisor( precision );
}

function getSmallestUnitDivisor( precision: number ): number {
	return 10 ** precision;
}

export default formatCurrency;
