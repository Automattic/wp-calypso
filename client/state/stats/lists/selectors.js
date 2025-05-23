import { createSelector } from '@automattic/state-utils';
import treeSelect from '@automattic/tree-select';
import { get, map, flatten } from 'lodash';
import { getSite } from 'calypso/state/sites/selectors';
import { getSerializedStatsQuery, normalizers, buildExportArray } from './utils';

import 'calypso/state/stats/init';

/**
 * Returns true if currently requesting stats for the statType and query combo, or false
 * otherwise.
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {Object}  query    Stats query object
 * @returns {boolean}          Whether stats are being requested
 */
export function isRequestingSiteStatsForQuery( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return !! get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'requesting' ] );
}

/**
 * Returns true if the stats request for the statType and query combo has finished, or false
 * otherwise.
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {Object}  query    Stats query object
 * @returns {boolean}          Whether stats are being requested
 */
export function hasSiteStatsForQueryFinished( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return (
		get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'status' ] ) ===
			'success' ||
		get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'status' ] ) === 'error'
	);
}

/**
 * Returns true if the stats request for the statType and query combo has failed, or false
 * otherwise.
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {Object}  query    Stats query object
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
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {Object}  query    Stats query object
 * @returns {?Object}           Data for the query
 */
export function getSiteStatsForQuery( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return get( state.stats.lists.items, [ siteId, statType, serializedQuery ], null );
}

/**
 * Returns a parsed object of statsStreak data for a given query, or default "empty" object
 * if no statsStreak data has been received for that site.
 * @param   {Object}  state    			Global state tree
 * @param   {number}  siteId   			Site ID
 * @param   {Object}  query    			Stats query object
 * @param   {?number} query.gmtOffset    GMT offset of the queried site
 * @returns {Object}           			Parsed Data for the query
 */
export const getSiteStatsPostStreakData = treeSelect(
	( state, siteId, query ) => [ getSiteStatsForQuery( state, siteId, 'statsStreak', query ) ],
	( [ streakData ], siteId, query ) => {
		const gmtOffset = query.gmtOffset || 0;
		const response = {};
		// ensure streakData.data exists and it is not an array
		if ( streakData && streakData.data && ! Array.isArray( streakData.data ) ) {
			Object.keys( streakData.data ).forEach( ( timestamp ) => {
				const time = new Date( timestamp * 1000 );
				time.setUTCHours( time.getUTCHours() + gmtOffset );
				const datestamp = time.toISOString().slice( 0, 10 );

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
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {Object}  query    Stats query object
 * @returns {*}                Normalized Data for the query, typically an array or object
 */
export const getVideoPressPlaysComplete = treeSelect(
	( state, siteId, statType, query ) => [
		getSiteStatsForQuery( state, siteId, statType, query ),
		getSite( state, siteId ),
	],
	( [ siteStats ] ) => {
		return siteStats;
	},
	{
		getCacheKey: ( siteId, statType, query ) =>
			[ siteId, statType, getSerializedStatsQuery( query ) ].join(),
	}
);

/**
 * Returns normalized stats data for a given query and stat type, or the un-normalized response
 * from the API if no normalizer method for that stats type exists in ./utils
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @param   {string}  statType Type of stat
 * @param   {Object}  query    Stats query object
 * @returns {*}                Normalized Data for the query, typically an array or object
 */
export const getSiteStatsNormalizedData = treeSelect(
	( state, siteId, statType, query ) => [
		getSiteStatsForQuery( state, siteId, statType, query ),
		getSite( state, siteId ),
	],
	( [ siteStats, site ], siteId, statType, query ) => {
		let normalizedStats = siteStats;
		const normalizer = normalizers[ statType ];
		if ( typeof normalizer === 'function' ) {
			normalizedStats = normalizer( normalizedStats, query, siteId, site );
		}
		// TODO: no need to slice the data here when the endpoint support `max` query param.
		return normalizedStats?.length && query?.max
			? normalizedStats.slice( 0, query.max )
			: normalizedStats;
	},
	{
		getCacheKey: ( siteId, statType, query ) =>
			[ siteId, statType, getSerializedStatsQuery( query ) ].join(),
	}
);

/**
 * Returns an array of stats data ready for csv export
 * @template T
 * @param   {Object}  state                                             Global state tree
 * @param   {number}  siteId                                            Site ID
 * @param   {string}  statType                                          Type of stat
 * @param   {Object}  query                                             Stats query object
 * @param   {(value: unknown[], data?: Object) => unknown[]} modifierFn Modifies the export row.
 * @returns {Array}                                                     Array of stats data ready for CSV export
 */
export function getSiteStatsCSVData( state, siteId, statType, query, modifierFn = null ) {
	const data = getSiteStatsNormalizedData( state, siteId, statType, query );
	if ( ! data || ! Array.isArray( data ) ) {
		return [];
	}

	return flatten(
		map( data, ( item ) => {
			return buildExportArray( item, null, modifierFn );
		} )
	);
}

/**
 * Returns the date of the last site stats query
 * @param  {Object}  state    Global state tree
 * @param  {number}  siteId   Site ID
 * @param  {string}  statType Type of stat
 * @param  {Object}  query    Stats query object
 * @returns {Date}             Date of the last site stats query
 */
export function getSiteStatsQueryDate( state, siteId, statType, query ) {
	const serializedQuery = getSerializedStatsQuery( query );
	return get( state.stats.lists.requests, [ siteId, statType, serializedQuery, 'date' ] );
}

/**
 * Returns the date of the last site stats query
 * @param   {Object}  state    Global state tree
 * @param   {number}  siteId   Site ID
 * @returns {Object}           Stats View Summary
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
		const newDate = new Date( date );
		const years = newDate.getFullYear();
		const months = newDate.getMonth();

		if ( ! viewSummary[ years ] ) {
			viewSummary[ years ] = {};
		}

		if ( ! viewSummary[ years ][ months ] ) {
			viewSummary[ years ][ months ] = {
				total: 0,
				data: [],
				average: 0,
				daysInMonth: new Date( years, months + 1, 0 ).getDate(),
			};
		}
		viewSummary[ years ][ months ].total += value;
		viewSummary[ years ][ months ].data.push( item );
		const average =
			viewSummary[ years ][ months ].total / viewSummary[ years ][ months ].daysInMonth;
		viewSummary[ years ][ months ].average = Math.round( average );
	} );

	// With the current month, calculate the average based on the days passed so far in the month
	const date = new Date();
	const thisMonth =
		viewSummary[ date.getFullYear() ] && viewSummary[ date.getFullYear() ][ date.getMonth() ];

	if ( thisMonth ) {
		thisMonth.daysInMonth = date.getDate();
		thisMonth.average = Math.round( thisMonth.total / thisMonth.daysInMonth );
	}

	return viewSummary;
}

export const getSiteStatsViewSummaryMemoized = createSelector(
	getSiteStatsViewSummary,
	( state, siteId ) => [ siteId ]
);

export const getMostPopularDatetime = ( state, siteId, query ) => {
	const insightsData = getSiteStatsNormalizedData( state, siteId, 'statsInsights', query );
	return {
		day: insightsData?.day,
		time: insightsData?.hour,
	};
};

const getSortedPostsAndPages = ( data ) => {
	const topPosts = {};

	Object.values( data.days ).forEach( ( { postviews: posts } ) => {
		posts.forEach( ( post ) => {
			if ( post.id in topPosts ) {
				topPosts[ post.id ].views += post.views;
			} else {
				// Use the shallow copy of the post object to avoid mutating the original data.
				topPosts[ post.id ] = Object.assign( {}, post );
			}
		} );
	} );

	const sortedTopPosts = Object.values( topPosts ).sort( ( a, b ) => {
		if ( a.views > b.views ) {
			return -1;
		}
		if ( a.views < b.views ) {
			return 1;
		}
		return 0;
	} );

	return sortedTopPosts;
};

export const getTopPostAndPage = ( state, siteId, query ) => {
	const data = getSiteStatsForQuery( state, siteId, 'statsTopPosts', query );

	if ( ! data ) {
		return {
			post: null,
			page: null,
		};
	}

	const sortedTopPosts = getSortedPostsAndPages( data );

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

export const getTopPostAndPages = ( state, siteId, query ) => {
	const data = getSiteStatsForQuery( state, siteId, 'statsTopPosts', query );

	if ( ! data ) {
		return null;
	}

	const sortedTopPosts = getSortedPostsAndPages( data );

	if ( ! sortedTopPosts.length ) {
		return null;
	}

	return sortedTopPosts;
};
