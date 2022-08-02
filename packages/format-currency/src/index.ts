import { getCurrencyDefaults } from './currencies';
import numberFormat from './number-format';
import { FormatCurrencyOptions, CurrencyObject } from './types';

export { getCurrencyDefaults };

export { CURRENCIES } from './currencies';

/**
 * Formats money with a given currency code
 *
 * @param   {number}     number              number to format; assumed to be a float unless isInSmallestUnit is set.
 * @param   {string}     code                currency code e.g. 'USD'
 * @param   {object}     options             options object
 * @param   {string}     options.decimal     decimal symbol e.g. ','
 * @param   {string}     options.grouping    thousands separator
 * @param   {number}     options.precision   decimal digits
 * @param   {string}     options.symbol      currency symbol e.g. 'A$'
 * @param   {boolean}    options.stripZeros  whether to remove trailing zero cents
 * @param   {boolean}    options.smallestUnit  true if the number is an integer in the currency's smallest unit.
 * @returns {?string}                        A formatted string.
 */
export default function formatCurrency(
	number: number,
	code: string,
	options: FormatCurrencyOptions = {}
): string | null {
	const currencyDefaults = getCurrencyDefaults( code );
	if ( ! currencyDefaults || isNaN( number ) ) {
		return null;
	}
	const { decimal, grouping, precision, symbol, smallestUnit } = {
		...currencyDefaults,
		...options,
	};
	const sign = number < 0 ? '-' : '';
	if ( smallestUnit ) {
		if ( ! Number.isInteger( number ) ) {
			return null;
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
 * @param   {number}     number              number to format; assumed to be a float unless isInSmallestUnit is set.
 * @param   {string}     code                currency code e.g. 'USD'
 * @param   {object}     options             options object
 * @param   {string}     options.decimal     decimal symbol e.g. ','
 * @param   {string}     options.grouping    thousands separator
 * @param   {number}     options.precision   decimal digits
 * @param   {string}     options.symbol      currency symbol e.g. 'A$'
 * @param   {boolean}    options.smallestUnit  true if the number is an integer in the currency's smallest unit.
 * @returns {?CurrencyObject}                        A formatted string e.g. { symbol:'$', integer: '$99', fraction: '.99', sign: '-' }
 */
export function getCurrencyObject(
	number: number,
	code: string,
	options: FormatCurrencyOptions = {}
): CurrencyObject | null {
	const currencyDefaults = getCurrencyDefaults( code );
	if ( ! currencyDefaults || isNaN( number ) ) {
		return null;
	}
	const { decimal, grouping, precision, symbol, smallestUnit } = {
		...currencyDefaults,
		...options,
	};
	const sign = number < 0 ? '-' : '';
	if ( smallestUnit ) {
		if ( ! Number.isInteger( number ) ) {
			return null;
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
