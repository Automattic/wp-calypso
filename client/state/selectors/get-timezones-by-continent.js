/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Return the timezones by continent data
 * gotten from state.timezones subtree.
 *
 * @param  {Object}  state - Global state tree
 * @return {Array} An object with the timezones grouped by continents
 */
export default function getTimezonesByContinent( state ) {
	return get( state, 'timezones.items.timezones_by_continent', null );
}
