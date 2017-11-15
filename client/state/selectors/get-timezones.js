/** @format */

/**
 * External dependencies
 */

import { get, map, toPairs } from 'lodash';

/**
 * Internal dependencies
 */
import { getTimezonesLabel } from 'state/selectors/';

/**
 * Return all timezones ordered by arrays with
 * the following shape:
 * [
 *   [ <continent>, [
 *     [ <timezone-value>, <timezone-label> ],
 *   ] ]
 *   ...
 * ]
 *
 * This structure facilitates the creation of a select element.
 *
 * @param  {Object} state - Global state tree
 * @return {Array} Timezones arrays
 */
export default function getTimezones( state ) {
	const continents = toPairs( get( state, 'timezones.byContinents', null ) );

	if ( ! continents ) {
		return null;
	}

	return map( continents, zones => [
		zones[ 0 ],
		map( zones[ 1 ], value => [ value, getTimezonesLabel( state, value ) ] ),
	] );
}
