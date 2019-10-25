/**
 * External dependencies
 */
import { get, isArray, map, flatten } from 'lodash';
import moment from 'moment';

/**
 * Internal dependencies
 */
import treeSelect from '@automattic/tree-select';
import { getSerializedStatsQuery, normalizers, buildExportArray } from './utils';
import { getSite } from 'state/sites/selectors';

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
	return !! get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'requesting' ] );
}

/**
 * Returns true if the stats request for the statType and query combo has failed, or false
 * otherwise.
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  statType Type of stat
 * @param  {Object}  query    Stats query object
 * @return {Boolean}          Whether stats are being requested
 */
export function hasSiteStatsQueryFailed( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return (
		get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'status' ] ) === 'error'
	);
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
 * @param  {Object}  state    			Global state tree
 * @param  {Number}  siteId   			Site ID
 * @param  {Object}  query    			Stats query object
 * @param  {?Number} query.gmtOffset    GMT offset of the queried site
 * @return {Object}           			Parsed Data for the query
 */
export const getSiteStatsPostStreakData = treeSelect(
	( state, siteId, query ) => [ getSiteStatsForQuery( state, siteId, 'statsStreak', query ) ],
	( [ streakData ], siteId, query ) => {
		const gmtOffset = query.gmtOffset || 0;
		const response = {};
		// ensure streakData.data exists and it is not an array
		if ( streakData && streakData.data && ! isArray( streakData.data ) ) {
			Object.keys( streakData.data ).forEach( timestamp => {
				const postDay = moment.unix( timestamp ).locale( 'en' );
				const datestamp = postDay.utcOffset( gmtOffset ).format( 'YYYY-MM-DD' );

				if ( 'undefined' === typeof response[ datestamp ] ) {
					response[ datestamp ] = 0;
				}

				response[ datestamp ] += streakData.data[ timestamp ];
			} );
		}

		return response;
	},
	{
		getCacheKey: ( siteId, query ) => [ siteId, getSerializedStatsQuery( query ) ].join(),
	}
);

/**
 * Returns normalized stats data for a given query and stat type, or the un-normalized response
 * from the API if no normalizer method for that stats type exists in ./utils
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  statType Type of stat
 * @param  {Object}  query    Stats query object
 * @return {*}                Normalized Data for the query, typically an array or object
 */
export const getSiteStatsNormalizedData = treeSelect(
	( state, siteId, statType, query ) => [
		getSiteStatsForQuery( state, siteId, statType, query ),
		getSite( state, siteId ),
	],
	( [ siteStats, site ], siteId, statType, query ) => {
		const normalizer = normalizers[ statType ];
		if ( typeof normalizer !== 'function' ) {
			return siteStats;
		}
		return normalizer( siteStats, query, siteId, site );
	},
	{
		getCacheKey: ( siteId, statType, query ) =>
			[ siteId, statType, getSerializedStatsQuery( query ) ].join(),
	}
);

/**
 * Returns an array of stats data ready for csv export
 *
 * @param  {Object}  state    Global state tree
 * @param  {Number}  siteId   Site ID
 * @param  {String}  statType Type of stat
 * @param  {Object}  query    Stats query object
 * @return {Array}            Array of stats data ready for CSV export
 */
export function getSiteStatsCSVData( state, siteId, statType, query ) {
	const data = getSiteStatsNormalizedData( state, siteId, statType, query );
	if ( ! data || ! isArray( data ) ) {
		return [];
	}

	return flatten(
		map( data, item => {
			return buildExportArray( item );
		} )
	);
}
