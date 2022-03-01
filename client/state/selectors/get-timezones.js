import getTimezonesLabel from 'calypso/state/selectors/get-timezones-label';

import 'calypso/state/timezones/init';

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
 * @param  {object} state - Global state tree
 * @returns {Array} Timezones arrays
 */
export default function getTimezones( state ) {
	const continents = state.timezones?.byContinents ?? null;

	if ( ! continents ) {
		return null;
	}

	return Object.entries( continents ).map( ( zones ) => [
		zones[ 0 ],
		zones[ 1 ].map( ( value ) => [ value, getTimezonesLabel( state, value ) ] ),
	] );
}
