/**
 * External dependencies
 */
import get from 'lodash/get';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import i18n from 'lib/mixins/i18n';
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
export const getParsedStreakDataForQuery = createSelector(
	( state, siteId, query ) => {
		const response = { days: {}, best: { day: 0, percent: 0 }, max: 0 };
		const days = [ 0, 0, 0, 0, 0, 0, 0 ];
		let total = 0;
		const data = getSiteStatsForQuery( state, siteId, 'statsStreak', query ) || [];

		Object.keys( data ).forEach( ( timestamp ) => {
			const postDay = i18n.moment.unix( timestamp );
			const datestamp = postDay.format( 'YYYY-MM-DD' );
			if ( 'undefined' === typeof( response.days[ datestamp ] ) ) {
				response.days[ datestamp ] = 0;
			}

			response.days[ datestamp ] += data[ timestamp ];
			days[ postDay.day() ] += data[ timestamp ];
			total += data[ timestamp ];
		} );

		Object.keys( response.days ).forEach( ( datestamp ) => {
			if ( response.days[ datestamp ] > response.max ) {
				response.max = response.days[ datestamp ];
			}
		} );

		const maxDay = Math.max.apply( null, days );
		response.best.day = days.indexOf( maxDay );
		if ( total ) {
			response.best.percent = Math.round( 100 * ( maxDay / total ) );
		}

		return response;
	},
	( state, siteId, query ) => getSiteStatsForQuery( state, siteId, 'statsStreak', query ),
	( state, siteId, taxonomy, query ) => {
		const serializedQuery = getSerializedStatsQuery( query );
		return [ siteId, 'statsStreak', serializedQuery ].join();
	}
);
