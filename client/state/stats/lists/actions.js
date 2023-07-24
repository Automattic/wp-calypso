import wpcom from 'calypso/lib/wp';
import {
	ALL_SITES_STATS_RECEIVE,
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import 'calypso/state/stats/init';
import { PERIOD_ALL_TIME } from 'calypso/state/stats/emails/constants';

export const ALL_SITES_ID = -1;
/**
 * Returns an action object to be used in signalling that stats for a given type of stats and query
 * have been received.
 *
 * @param  {number} siteId   Site ID
 * @param  {string} statType Stat Key
 * @param  {Object} query    Stats query
 * @param  {Array}  data     Stat Data
 * @param  {Object} date	 Date
 * @returns {Object}          Action object
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

export function receiveAllSitesStats( query, data, date ) {
	return {
		type: ALL_SITES_STATS_RECEIVE,
		query,
		data,
		date,
	};
}

const wpcomV1Endpoints = {
	statsInsights: 'stats/insights',
	statsFileDownloads: 'stats/file-downloads',
	statsAds: 'wordads/stats',
	statsEmailsSummary: 'stats/emails/summary',
	statsEmailsSummaryByOpens: 'stats/emails/summary',
};

const wpcomV2Endpoints = {
	statsOrders: 'stats/orders',
	statsTopSellers: 'stats/top-sellers',
	statsTopEarners: 'stats/top-earners',
	statsTopCategories: 'stats/top-product-categories-by-usage',
	statsTopCoupons: 'stats/top-coupons-by-usage',
};

const wpcomV2AllSitesEndpoints = {
	allSitesStatsSummary: '/me/sites/stats/summary',
};

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve site stats.
 *
 * @param  {number} siteId   Site ID
 * @param  {string} statType Type of stats
 * @param  {Object} query    Stats Query
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
		if ( wpcomV1Endpoints.hasOwnProperty( statType ) ) {
			subpath = wpcomV1Endpoints[ statType ];
		} else if ( wpcomV2Endpoints.hasOwnProperty( statType ) ) {
			subpath = wpcomV2Endpoints[ statType ];
			apiNamespace = 'wpcom/v2';
		} else if ( siteId === ALL_SITES_ID && wpcomV2AllSitesEndpoints.hasOwnProperty( statType ) ) {
			subpath = wpcomV2AllSitesEndpoints[ statType ];
			apiNamespace = 'wpcom/v2';
		}

		const options = ( () => {
			switch ( statType ) {
				case 'statsVideo':
					return query.postId;
				case 'statsEmailsSummary':
					return {
						period: PERIOD_ALL_TIME,
						quantity: query.quantity ?? 10,
						sort_field: query.sort_field ?? 'post_id',
						sort_order: query.sort_order ?? 'desc',
					};
				case 'statsEmailsSummaryByOpens':
					return {
						period: PERIOD_ALL_TIME,
						quantity: query.quantity ?? 10,
						sort_field: 'opens',
						sort_order: 'desc',
					};
				default:
					return query;
			}
		} )();

		let requestStats;

		if ( subpath ) {
			const path = siteId === ALL_SITES_ID ? `${ subpath }` : `/sites/${ siteId }/${ subpath }`;
			requestStats = wpcom.req.get(
				{
					path,
					apiNamespace,
				},
				options
			);
		} else {
			requestStats = wpcom
				.site( siteId )
				[ statType ](
					options,
					'statsVideo' === statType ? { statType: query.statType, period: query.period } : {}
				);
		}

		return requestStats
			.then( ( data ) => {
				if ( siteId === ALL_SITES_ID ) {
					return dispatch( receiveAllSitesStats( query, data, Date.now() ) );
				}
				return dispatch( receiveSiteStats( siteId, statType, query, data, Date.now() ) );
			} )
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
