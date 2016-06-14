/**
 * External dependencies
 */
import formatter from 'currency-formatter';
import get from 'lodash/get';
import pickBy from 'lodash/pickBy';

// override symbol defaults for currency code
const symbolMap = {
	CAD: 'C$',
	AUD: 'A$'
};

/**
 * Formats money with a given currency code
 * @param   {Number}     number              number to format
 * @param   {Object}     options             options object
 * @param   {String}     options.symbol      currency symbol e.g. 'A$'
 * @param   {String}     options.decimal     decimal symbol e.g. ','
 * @param   {String}     options.thousand    thousands separator
 * @param   {Number}     options.precision   decimal digits
 * @param   {String}     options.format      a custom format string
 * @returns {String}                         A formatted string.
 */
export default function currencyFormatter( number, options = {} ) {
	const defaults = findCurrency( options.code );
	return formatter.format( number, Object.assign( {}, { symbol: defaults.symbol }, options ) );
}

/**
 * Returns currency defaults. This does not necessarily map 1:1 to option arguments
 * @param   {String} code     currency code
 * @returns {Object}          currency defaults
 */
export function findCurrency( code ) {
	const defaults = formatter.findCurrency( code );
	const defaultOverrides = pickBy( {
		symbol: get( symbolMap, code, null )
	}, ( value ) => {
		return !! value;
	} );
	return Object.assign( {}, defaults, defaultOverrides );
}
