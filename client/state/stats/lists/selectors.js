/**
 * External dependencies
 */
import { get, isArray, map, flatten, round } from 'lodash';
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
			Object.keys( streakData.data ).forEach( ( timestamp ) => {
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
		map( data, ( item ) => {
			return buildExportArray( item );
		} )
	);
}

/**
 * Returns the date of the last site stats query
 *
 * @param  {object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  statType Type of stat
 * @param  {object}  query    Stats query object
 * @returns {Date}             Date of the last site stats query
 */
export function getSiteStatsQueryDate( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'date' ] );
}

/**
 * Returns the date of the last site stats query
 *
 * @param   {object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {object}           Stats View Summary
 */
export function getSiteStatsViewSummary( state, siteId ) {
	const query = {
		stat_fields: 'views',
		quantity: -1,
	};
	const viewData = getSiteStatsForQuery( state, siteId, 'statsVisits', query );

	if ( ! viewData || ! viewData.data ) {
		return null;
	}

	const viewSummary = {};

	viewData.data.forEach( ( item ) => {
		const [ date, value ] = item;
		const momentDate = moment( date );
		const { years, months } = momentDate.toObject();

		if ( ! viewSummary[ years ] ) {
			viewSummary[ years ] = {};
		}

		if ( ! viewSummary[ years ][ months ] ) {
			viewSummary[ years ][ months ] = {
				total: 0,
				data: [],
				average: 0,
				daysInMonth: momentDate.daysInMonth(),
			};
		}
		viewSummary[ years ][ months ].total += value;
		viewSummary[ years ][ months ].data.push( item );
		const average =
			viewSummary[ years ][ months ].total / viewSummary[ years ][ months ].daysInMonth;
		viewSummary[ years ][ months ].average = round( average, 0 );
	} );

	return viewSummary;
}

export const getMostPopularDatetime = ( state, siteId, query ) => {
	const insightsData = getSiteStatsNormalizedData( state, siteId, 'statsInsights', query );
	return {
		day: insightsData?.day,
		time: insightsData?.hour,
	};
};

export const getTopPostAndPage = ( state, siteId, query ) => {
	const data = getSiteStatsForQuery( state, siteId, 'statsTopPosts', query );

	if ( ! data ) {
		return {
			post: null,
			page: null,
		};
	}

	const topPosts = {};

	Object.values( data.days ).forEach( ( { postviews: posts } ) => {
		posts.forEach( ( post ) => {
			if ( post.id in topPosts ) {
				topPosts[ post.id ].views += post.views;
			} else {
				topPosts[ post.id ] = post;
			}
		} );
	} );

	const sortedTopPosts = Object.values( topPosts ).sort( ( a, b ) => a.views > b.views );

	if ( ! sortedTopPosts.length ) {
		return {
			post: null,
			page: null,
		};
	}

	return {
		post: sortedTopPosts.find( ( { type } ) => type === 'post' ),
		page: sortedTopPosts.find( ( { type } ) => type === 'page' ),
	};
};
