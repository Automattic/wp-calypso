/**
 * External dependencies
 */
import { fromPairs, map } from 'lodash';

/**
 * Internal dependencies
 */
import getTimezonesByContinent from 'calypso/state/selectors/get-timezones-by-continent';
import getTimezonesLabel from 'calypso/state/selectors/get-timezones-label';

import 'calypso/state/timezones/init';

/**
 * Return the timezones by continent data
 * gotten from state.timezones subtree.
 *
 * @param  {object} state - Global state tree
 * @param {string} continent - continent value
 * @returns {Array} Continent timezones array
 */
export default function getTimezonesLabelsByContinent( state, continent ) {
	const timezones = getTimezonesByContinent( state, continent );

	if ( ! timezones ) {
		return null;
	}

	return fromPairs( map( timezones, ( value ) => [ value, getTimezonesLabel( state, value ) ] ) );
}
