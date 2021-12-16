import wpcom from 'calypso/lib/wp';
import {
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import 'calypso/state/stats/init';

/**
 * Returns an action object to be used in signalling that stats for a given type of stats and query
 * have been received.
 *
 * @param  {number} siteId   Site ID
 * @param  {string} statType Stat Key
 * @param  {object} query    Stats query
 * @param  {Array}  data     Stat Data
 * @param  {object} date	 Date
 * @returns {object}          Action object
 */
export function receiveSiteStats( siteId, statType, query, data, date ) {
	return {
		type: SITE_STATS_RECEIVE,
		statType,
		siteId,
		query,
		data,
		date,
	};
}

const wpcomV1Endpoints = {
	stats: 'stats',
	statsAds: 'wordads/stats',
	statsClicks: 'stats/clicks',
	statsCommentFollowers: 'stats/comment-followers',
	statsComments: 'stats/comments',
	statsCountryViews: 'stats/country-views',
	statsFileDownloads: 'stats/file-downloads',
	statsFollowers: 'stats/followers',
	statsInsights: 'stats/insights',
	statsPublicize: 'stats/publicize',
	statsReferrers: 'stats/referrers',
	statsSearchTerms: 'stats/search-terms',
	statsStreak: 'stats/streak',
	statsSummary: 'stats/summary',
	statsTags: 'stats/tags',
	statsTopAuthors: 'stats/top-authors',
	statsTopPosts: 'stats/top-posts',
	statsVideoPlays: 'stats/video-plays',
	statsVisits: 'stats/visits',
};

const wpcomV2Endpoints = {
	statsOrders: 'stats/orders',
	statsStoreReferrers: 'stats/events-by-referrer',
	statsTopSellers: 'stats/top-sellers',
	statsTopEarners: 'stats/top-earners',
	statsTopCategories: 'stats/top-product-categories-by-usage',
	statsTopCoupons: 'stats/top-coupons-by-usage',
};

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve site stats.
 *
 * @param  {number} siteId   Site ID
 * @param  {string} statType Type of stats
 * @param  {object} query    Stats Query
 * @returns {Function}        Action thunk
 */
export function requestSiteStats( siteId, statType, query ) {
	return ( dispatch ) => {
		dispatch( {
			type: SITE_STATS_REQUEST,
			statType,
			siteId,
			query,
		} );

		let subpath;
		let apiNamespace;
		let options = query;
		if ( wpcomV1Endpoints.hasOwnProperty( statType ) ) {
			subpath = wpcomV1Endpoints[ statType ];
		} else if ( wpcomV2Endpoints.hasOwnProperty( statType ) ) {
			subpath = wpcomV2Endpoints[ statType ];
			apiNamespace = 'wpcom/v2';
		}

		if ( 'statsVideo' === statType ) {
			subpath += `/${ query.postId }`;
			options = {};
		}

		return wpcom.req
			.get( { path: `/sites/${ siteId }/${ subpath }`, apiNamespace }, options )
			.then( ( data ) => dispatch( receiveSiteStats( siteId, statType, query, data, Date.now() ) ) )
			.catch( ( error ) => {
				dispatch( {
					type: SITE_STATS_REQUEST_FAILURE,
					statType,
					siteId,
					query,
					error,
				} );
			} );
	};
}
