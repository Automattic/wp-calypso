/**
 * External dependencies
 */
import sortBy from 'lodash/sortBy';
import toPairs from 'lodash/toPairs';
import camelCase from 'lodash/camelCase';
import mapKeys from 'lodash/mapKeys';

/**
 * Returns a serialized stats query, used as the key in the
 * `state.stats.lists.items` and `state.stats.lists.requesting` state objects.
 *
 * @param  {Object} query    Stats query
 * @return {String}          Serialized stats query
 */
export function getSerializedStatsQuery( query = {} ) {
	return JSON.stringify( sortBy( toPairs( query ), ( pair ) => pair[ 0 ] ) );
}

export const Parsers = {
	/**
	 * Returns a parsed payload from `/sites/{ site }/stats`
	 *
	 * @param  {Object} data    Stats query
	 * @return {Object?}        Parsed stats data
	 */
	stats: ( data ) => {
		if ( ! data || ! data.stats ) {
			return null;
		}

		const parseData = {};
		mapKeys( data.stats, ( value, key ) => {
			parseData[ camelCase( key ) ] = value;
		} );

		return parseData;
	}
};
