/**
 * External dependencies
 */
import sortBy from 'lodash/sortBy';
import toPairs from 'lodash/toPairs';
import i18n from 'i18n-calypso';

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

/**
 * Returns a standard query for use with the `statsStreak` endpoint
 *
 * @param  {Object} query    Query options
 * @return {String}          Serialized stats query
 */
export function getStatsStreakQuery( query = {} ) {
	const defaultQuery = {
		startDate: i18n.moment().subtract( 1, 'year' ).startOf( 'month' ).format( 'YYYY-MM-DD' ),
		endDate: i18n.moment().endOf( 'month' ).format( 'YYYY-MM-DD' ),
		max: 3000
	};

	return Object.assign( {}, defaultQuery, query );
}
