/** @format */

/**
 * External dependencies
 */

import { fromPairs, map } from 'lodash';

/**
 * Internal dependencies
 */
import getTimezonesByContinent from 'state/selectors/get-timezones-by-continent';

import getTimezonesLabel from 'state/selectors/get-timezones-label';

/**
 * Return the timezones by continent data
 * gotten from state.timezones subtree.
 *
 * @param  {Object} state - Global state tree
 * @param {String} continent - continent value
 * @return {Array} Continent timezones array
 */
export default function getTimezonesLabelsByContinent( state, continent ) {
	const timezones = getTimezonesByContinent( state, continent );

	if ( ! timezones ) {
		return null;
	}

	return fromPairs( map( timezones, value => [ value, getTimezonesLabel( state, value ) ] ) );
}
