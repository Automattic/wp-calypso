/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return the timezones by continent data
 * gotten from state.timezones subtree.
 *
 * @param  {Object} state - Global state tree
 * @param {String} continent - continent value
 * @return {Array} Continent timezones array
 */
export default function getTimezonesByContinent( state, continent ) {
	const byContinents = get( state, 'timezones.byContinents', {} );
	return byContinents[ continent ] ? byContinents[ continent ] : null;
}
