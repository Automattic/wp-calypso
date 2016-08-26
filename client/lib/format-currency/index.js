/**
 * External dependencies
 */
import { numberFormat } from 'i18n-calypso';

const CURRENCIES = {
	USD: {
		symbol: '$',
		grouping: ',',
		decimal: '.',
		precision: 2
	},
	AUD: {
		symbol: 'A$',
		grouping: ',',
		decimal: '.',
		precision: 2
	},
	CAD: {
		symbol: 'C$',
		grouping: ',',
		decimal: '.',
		precision: 2
	},
	EUR: {
		symbol: '€',
		grouping: '.',
		decimal: ',',
		precision: 2
	},
	GBP: {
		symbol: '£',
		grouping: ',',
		decimal: '.',
		precision: 2
	},
	JPY: {
		symbol: '¥',
		grouping: ',',
		decimal: '.',
		precision: 0
	}
};

/**
 * Formats money with a given currency code
 * @param   {Number}     number              number to format
 * @param   {String}     code                currency code e.g. 'USD'
 * @param   {Object}     options             options object
 * @param   {String}     options.decimal     decimal symbol e.g. ','
 * @param   {String}     options.grouping    thousands separator
 * @param   {Number}     options.precision   decimal digits
 * @param   {String}     options.symbol      currency symbol e.g. 'A$'
 * @returns {?String}                        A formatted string.
 */
export default function formatCurrency( number, code, options = {} ) {
	const currencyDefaults = getCurrencyDefaults( code );
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
 * @param   {String}     code                currency code e.g. 'USD'
 * @param   {Object}     options             options object
 * @param   {String}     options.decimal     decimal symbol e.g. ','
 * @param   {String}     options.grouping    thousands separator
 * @param   {Number}     options.precision   decimal digits
 * @param   {String}     options.symbol      currency symbol e.g. 'A$'
 * @returns {?String}                        A formatted string e.g. { symbol:'$', integer: '$99', fraction: '.99', sign: '-' }
 */
export function getCurrencyObject( number, code, options = {} ) {
	const currencyDefaults = getCurrencyDefaults( code );
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
	const rawInteger = Math.floor( absNumber );
	const integer = numberFormat( rawInteger, {
		decimals: 0,
		thousandsSep: grouping,
		decPoint: decimal
	} );
	const fraction = precision > 0
		? numberFormat( absNumber - rawInteger, {
			decimals: precision,
			thousandsSep: grouping,
			decPoint: decimal
		} ).slice( 1 )
		: '';
	return {
		sign,
		symbol,
		integer,
		fraction
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
