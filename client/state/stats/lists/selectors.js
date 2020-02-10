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

import 'state/stats/init';

/**
 * Returns true if currently requesting stats for the statType and query combo, or false
 * otherwise.
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {object}  query    Stats query object
 * @returns {boolean}          Whether stats are being requested
 */
export function isRequestingSiteStatsForQuery( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return !! get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'requesting' ] );
}

/**
 * Returns true if the stats request for the statType and query combo has failed, or false
 * otherwise.
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {object}  query    Stats query object
 * @returns {boolean}          Whether stats are being requested
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
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {object}  query    Stats query object
 * @returns {?object}           Data for the query
 */
export function getSiteStatsForQuery( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return get( state.stats.lists.items, [ siteId, statType, serializedQuery ], null );
}

/**
 * Returns a parsed object of statsStreak data for a given query, or default "empty" object
 * if no statsStreak data has been received for that site.
 *
 * @param   {object}  state    			Global state tree
 * @param   {number}  siteId   			Site ID
 * @param   {object}  query    			Stats query object
 * @param   {?number} query.gmtOffset    GMT offset of the queried site
 * @returns {object}           			Parsed Data for the query
 */
export const getSiteStatsPostStreakData = treeSelect(
	( state, siteId, query ) => [ getSiteStatsForQuery( state, siteId, 'statsStreak', query ) ],
	( [ streakData ], siteId, query ) => {
		const gmtOffset = query.gmtOffset || 0;
		const response = {};
		// ensure streakData.data exists and it is not an array
		if ( streakData && streakData.data && ! isArray( streakData.data ) ) {
			Object.keys( streakData.data ).forEach( timestamp => {
				const postDay = moment.unix( timestamp );
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
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {object}  query    Stats query object
 * @returns {*}                Normalized Data for the query, typically an array or object
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
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {object}  query    Stats query object
 * @returns {Array}            Array of stats data ready for CSV export
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
