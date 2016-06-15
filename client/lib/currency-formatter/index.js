/**
 * External dependencies
 */
import { numberFormat } from 'i18n-calypso';

const CURRENCIES = {
	USD: {
		code: 'USD',
		symbol: '$',
		grouping: ',',
		decimal: '.',
		precision: 2
	},
	AUD: {
		code: 'AUD',
		symbol: 'A$',
		grouping: ',',
		decimal: '.',
		precision: 2
	},
	CAD: {
		code: 'CAD',
		symbol: 'C$',
		grouping: ',',
		decimal: '.',
		precision: 2
	},
	EUR: {
		code: 'EUR',
		symbol: '€',
		grouping: '.',
		decimal: ',',
		precision: 2
	},
	GBP: {
		code: 'GBP',
		symbol: '£',
		grouping: ',',
		decimal: '.',
		precision: 2
	},
	JPY: {
		code: 'JPY',
		symbol: '¥',
		grouping: ',',
		decimal: '.',
		precision: 0
	}
};

/**
 * Formats money with a given currency code
 * @param   {Number}     number              number to format
 * @param   {Object}     options             options object
 * @param   {String}     options.code        currency code e.g. 'USD'
 * @param   {String}     options.decimal     decimal symbol e.g. ','
 * @param   {String}     options.grouping    thousands separator
 * @param   {Number}     options.precision   decimal digits
 * @param   {String}     options.symbol      currency symbol e.g. 'A$'
 * @returns {?String}                        A formatted string.
 */
export default function formatCurrency( number, options = {} ) {
	const currencyDefaults = getCurrencyDefaults( options.code );
	if ( ! currencyDefaults || isNaN( number ) ) {
		return null;
	}
	const {
		decimal,
		grouping,
		precision,
		symbol
	} = { ...currencyDefaults, ...options };
	const sign = number < 0 ? '-' : '';
	const value = numberFormat( Math.abs( number ), {
		decimals: precision,
		thousandsSep: grouping,
		decPoint: decimal
	} );
	return `${ sign }${ symbol }${ value }`;
}

/**
 * Returns a formatted price object.
 * @param   {Number}     number              number to format
 * @param   {Object}     options             options object
 * @param   {String}     options.code        currency code e.g. 'USD'
 * @param   {String}     options.decimal     decimal symbol e.g. ','
 * @param   {String}     options.grouping    thousands separator
 * @param   {Number}     options.precision   decimal digits
 * @param   {String}     options.symbol      currency symbol e.g. 'A$'
 * @returns {?String}                        A formatted string e.g. { symbol:'$', dollars: '$99', cents: '.99', sign: '-' }
 */
export function getCurrencyObject( number, options = {} ) {
	const currencyDefaults = getCurrencyDefaults( options.code );
	if ( ! currencyDefaults || isNaN( number ) ) {
		return null;
	}
	const {
		decimal,
		grouping,
		precision,
		symbol
	} = { ...currencyDefaults, ...options };
	const sign = number < 0 ? '-' : '';
	const absNumber = Math.abs( number );
	const rawDollars = Math.floor( absNumber );
	const dollars = numberFormat( rawDollars, {
		decimals: 0,
		thousandsSep: grouping,
		decPoint: decimal
	} );
	const cents = precision > 0 ? numberFormat( absNumber - rawDollars, {
		decimals: precision,
		thousandsSep: grouping,
		decPoint: decimal
	} ).slice( 1 ) : '';
	return {
		sign,
		symbol,
		dollars,
		cents
	};
}

/**
 * Returns currency defaults.
 * @param   {String} code      currency code
 * @returns {?Object}          currency defaults
 */
export function getCurrencyDefaults( code ) {
	return CURRENCIES[ code ] || null;
}
