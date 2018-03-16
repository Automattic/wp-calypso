/** @format */

/**
 * External dependencies
 */
import { sortBy } from 'lodash';

/**
 * Sort Referrer data by sales DESC and optionally trim results
 * @param {array} data - One unit's worth of data
 * @param {number} [limit] - trim results to a certain length
 * @returns {array} - The sorted and trimmed (if desired) array
 */
export function sortBySales( data, limit ) {
	if ( ! Array.isArray( data ) ) {
		throw new Error( 'Incorrect data structure applied to "sortBySales". Input must be an array' );
	}
	const computedLimit = limit || data.length;
	return sortBy( data, d => -d.sales ).slice( 0, computedLimit );
}
