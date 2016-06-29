/**
 * External dependencies
 */
import forOwn from 'lodash/forOwn';
import get from 'lodash/get';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import createSelector from 'lib/create-selector';
import {
	getSerializedStatsQuery,
	normalizers
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
		const streakData = getSiteStatsForQuery( state, siteId, 'statsStreak', query );

		if ( streakData && streakData.data ) {
			Object.keys( streakData.data ).forEach( ( timestamp ) => {
				const postDay = i18n.moment.unix( timestamp ).locale( 'en' );
				const datestamp = postDay.format( 'YYYY-MM-DD' );
				if ( 'undefined' === typeof( response[ datestamp ] ) ) {
					response[ datestamp ] = 0;
				}

				response[ datestamp ] += streakData.data[ timestamp ];
			} );
		}

		return response;
	},
	( state, siteId, query ) => getSiteStatsForQuery( state, siteId, 'statsStreak', query ),
	( state, siteId, query ) => {
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
		let max = 0;

		forOwn( getSiteStatsPostStreakData( state, siteId, query ), count => {
			if ( count > max ) {
				max = count;
			}
		} );

		return max || null;
	},
	( state, siteId, query ) => getSiteStatsForQuery( state, siteId, 'statsStreak', query ),
	( state, siteId, query ) => {
		const serializedQuery = getSerializedStatsQuery( query );
		return [ siteId, 'statsStreakMax', serializedQuery ].join();
	}
);

/**
 * Returns a number representing the posts made during a day for a given query
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Stats query object
 * @param  {String}  date   Date in YYYY-MM-DD format
 * @return {?Number}        Number of posts made on date
 */
export function getSiteStatsPostsCountByDay( state, siteId, query, date ) {
	const data = getSiteStatsPostStreakData( state, siteId, query );
	return data[ date ] || null;
}

/**
 * Returns normalized stats data for a given query and stat type, or the un-normalized response
 * from the API if no normalizer method for that stats type exists in ./utils
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {Object}  query    Stats query object
 * @return {*}                Normalized Data for the query, typically an array or object
 */
export const getSiteStatsNormalizedData = createSelector(
	( state, siteId, statType, query ) => {
		const data = getSiteStatsForQuery( state, siteId, statType, query );

		if ( 'function' === typeof normalizers[ statType ] ) {
			return normalizers[ statType ].call( this, data );
		}

		return data;
	},
	( state, siteId, statType, query ) => getSiteStatsForQuery( state, siteId, statType, query ),
	( state, siteId, statType, query ) => {
		const serializedQuery = getSerializedStatsQuery( query );
		return [ siteId, statType, serializedQuery ].join();
	}
);
