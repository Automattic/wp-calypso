/**
 * External dependencies
 */
import formatter from 'currency-formatter';
import get from 'lodash/get';

// override symbol defaults for currency code
const symbolMap = {
	CAD: 'C$',
	AUD: 'A$'
};

const thousandsMap = {
	EUR: '.'
};

/**
 * Formats money with a given currency code
 * @param   {Number}     number              number to format
 * @param   {Object}     options             options object
 * @param   {String}     options.code        currency code e.g. 'USD'
 * @param   {String}     options.symbol      currency symbol e.g. 'A$'
 * @param   {String}     options.decimal     decimal symbol e.g. ','
 * @param   {String}     options.thousand    thousands separator
 * @param   {Number}     options.precision   decimal digits
 * @param   {String}     options.format      a custom format string
 * @returns {String}                         A formatted string.
 */
export default function currencyFormatter( number, options = {} ) {
	const { symbol, thousandsSeparator } = findCurrency( options.code );
	return formatter.format( number, Object.assign( { symbol, thousand: thousandsSeparator }, options ) );
}

/**
 * Returns currency defaults. This does not necessarily map 1:1 to option arguments
 * @param   {String} code     currency code
 * @returns {Object}          currency defaults
 */
export function findCurrency( code ) {
	const currency = formatter.findCurrency( code );
	return {
		...currency,
		symbol: get( symbolMap, code, currency.symbol ),
		thousandsSeparator: get( thousandsMap, code, currency.thousandsSeparator )
	};
}
