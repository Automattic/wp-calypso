import wpcom from 'calypso/lib/wp';
import {
	SITE_STATS_RECEIVE,
	SITE_STATS_REQUEST,
	SITE_STATS_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import 'calypso/state/stats/init';
import { PERIOD_ALL_TIME } from 'calypso/state/stats/emails/constants';

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

const wpcomV1Endpoints = {
	statsInsights: 'stats/insights',
	statsFileDownloads: 'stats/file-downloads',
	statsAds: 'wordads/stats',
	statsEmailsOpen: 'stats/opens/emails/summary',
	statsEmailsClick: 'stats/clicks/emails/summary',
};

const wpcomV2Endpoints = {
	statsOrders: 'stats/orders',
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
		}

		const options = ( () => {
			switch ( statType ) {
				case 'statsVideo':
					return query.postId;
				case 'statsEmailsOpen':
				case 'statsEmailsClick':
					return { period: PERIOD_ALL_TIME, quantity: 10 };
				default:
					return query;
			}
		} )();

		const requestStats = subpath
			? wpcom.req.get(
					{
						path: `/sites/${ siteId }/${ subpath }`,
						apiNamespace,
					},
					options
			  )
			: wpcom
					.site( siteId )
					[ statType ](
						options,
						'statsVideo' === statType ? { statType: query.statType, period: query.period } : {}
					);

		return requestStats
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
