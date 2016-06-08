/**
 * External dependencies
 */
import get from 'lodash/get';
import values from 'lodash/values';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import {
	getSerializedStatsQuery
} from './utils';

/**
 * Returns true if currently requesting stats for the statType and query combo, or false
 * otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  statType Type of stat
 * @param  {Object}  query    Stats query object
 * @return {Boolean}          Whether stats are being requested
 */
export function isRequestingSiteStatsForQuery( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return !! get( state.stats.lists.requesting, [ siteId, statType, serializedQuery ] );
}

/**
 * Returns object of stats data for the statType and query combo, or null if no stats have been
 * received.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  statType Type of stat
 * @param  {Object}  query    Stats query object
 * @return {?Object}           Data for the query
 */
export function getSiteStatsForQuery( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return get( state.stats.lists.items, [ siteId, statType, serializedQuery ], null );
}

/**
 * Returns a parsed object of statsStreak data for a given query, or default "empty" object
 * if no statsStreak data has been received for that site.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {Object}  query    Stats query object
 * @return {Object}           Parsed Data for the query
 */
export const getSiteStatsPostStreakData = createSelector(
	( state, siteId, query ) => {
		const response = {};
		const data = getSiteStatsForQuery( state, siteId, 'statsStreak', query ) || [];

		Object.keys( data ).forEach( ( timestamp ) => {
			const postDay = i18n.moment.unix( timestamp );
			const datestamp = postDay.format( 'YYYY-MM-DD' );
			if ( 'undefined' === typeof( response[ datestamp ] ) ) {
				response[ datestamp ] = 0;
			}

			response[ datestamp ] += data[ timestamp ];
		} );

		return response;
	},
	( state, siteId, query ) => getSiteStatsForQuery( state, siteId, 'statsStreak', query ),
	( state, siteId, taxonomy, query ) => {
		const serializedQuery = getSerializedStatsQuery( query );
		return [ siteId, 'statsStreak', serializedQuery ].join();
	}
);

/**
 * Returns a number representing the most posts made during a day for a given query
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {Object}  query    Stats query object
 * @return {?Number}          Max number of posts by day
 */
export const getSiteStatsMaxPostsByDay = createSelector(
	( state, siteId, query ) => {
		const data = values( getSiteStatsPostStreakData( state, siteId, query ) ).sort();

		if ( data.length ) {
			return data[ data.length - 1 ];
		}

		return null;
	},
	( state, siteId, query ) => getSiteStatsForQuery( state, siteId, 'statsStreak', query ),
	( state, siteId, taxonomy, query ) => {
		const serializedQuery = getSerializedStatsQuery( query );
		return [ siteId, 'statsStreakMax', serializedQuery ].join();
	}
);

