/** @format */

/**
 * External dependencies
 */
import trimEnd from 'lodash/trimEnd';

/**
 * Internal dependencies
 */
import { getCurrencyDefaults } from 'lib/format-currency/currencies';

// based on https://stackoverflow.com/a/10454560/59752
export const decimalPlaces = number => {
	const match = ( '' + number ).match( /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/ );
	if ( ! match ) {
		return 0;
	}
	return Math.max( 0, ( match[ 1 ] ? match[ 1 ].length : 0 ) - ( match[ 2 ] ? +match[ 2 ] : 0 ) );
};

export const formatPrice = ( price, currency, withSymbol = true ) => {
	const { precision, symbol } = getCurrencyDefaults( currency );
	const value = price.toFixed( precision );
	// Trim the dot at the end of symbol, e.g., 'kr.' becomes 'kr'
	return withSymbol ? `${ value } ${ trimEnd( symbol, '.' ) }` : value;
};
