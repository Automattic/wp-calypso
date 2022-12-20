import { doesCurrencyExist, getCurrencyDefaults } from './currencies';
import numberFormat from './number-format';
import { FormatCurrencyOptions, CurrencyObject, CurrencyObjectOptions } from './types';

export { getCurrencyDefaults };

export { CURRENCIES } from './currencies';

export * from './types';

function getLocaleFromBrowser() {
	if ( typeof window === 'undefined' ) {
		return 'en';
	}
	return window.navigator?.languages?.length > 0
		? window.navigator.languages[ 0 ]
		: window.navigator?.language ?? 'en';
}

function getPrecisionForLocaleAndCurrency( locale: string, currency: string ): number {
	const defaultFormatter = new Intl.NumberFormat( locale, {
		style: 'currency',
		currency,
	} );
	return defaultFormatter.resolvedOptions().maximumFractionDigits;
}

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
): string | null {
	if ( isNaN( number ) ) {
		// eslint-disable-next-line no-console
		console.warn( 'formatCurrency was called with NaN' );
		number = 0;
	}

	const locale = options.locale ?? getLocaleFromBrowser();
	let precision;
	try {
		precision = getPrecisionForLocaleAndCurrency( locale, code );
	} catch {
		// The above may throw if the currency is unknown, in which case we want to
		// default to USD.
		return formatCurrency( number, 'USD', options );
	}

	if ( options.isSmallestUnit ) {
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

	const formatter = new Intl.NumberFormat( locale, {
		style: 'currency',
		currency: code,
		// There's an option called `trailingZeroDisplay` but it does not yet work
		// in FF so we have to strip zeros manually.
		...( Number.isInteger( number ) && options.stripZeros ? { maximumFractionDigits: 0 } : {} ),
	} );
	return formatter.format( number );
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
 * If the number is NaN, this will return null.
 *
 * If the currency code is not known, this will assume a default currency
 * similar to USD.
 *
 * If `isSmallestUnit` is set and the number is not an integer, it will be
 * rounded to an integer.
 *
 * @param      {number}                   number     number to format; assumed to be a float unless isSmallestUnit is set.
 * @param      {string}                   code       currency code e.g. 'USD'
 * @param      {CurrencyObjectOptions}    options    options object
 * @returns    {?CurrencyObject}          A formatted string e.g. { symbol:'$', integer: '$99', fraction: '.99', sign: '-' }
 */
export function getCurrencyObject(
	number: number,
	code: string,
	options: CurrencyObjectOptions = {}
): CurrencyObject | null {
	if ( ! doesCurrencyExist( code ) ) {
		// eslint-disable-next-line no-console
		console.warn( `getCurrencyObject was called with an unknown currency "${ code }"` );
	}
	const currencyDefaults = getCurrencyDefaults( code );
	if ( isNaN( number ) ) {
		// eslint-disable-next-line no-console
		console.warn( 'getCurrencyObject was called with NaN' );
		return null;
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

function convertPriceForSmallestUnit( price: number, precision: number ): number {
	return price / getSmallestUnitDivisor( precision );
}

function getSmallestUnitDivisor( precision: number ): number {
	return 10 ** precision;
}

export default formatCurrency;
