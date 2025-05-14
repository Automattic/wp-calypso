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
 * @param  {number} siteId   Site ID
 * @param  {string} statType Stat Key
 * @param  {Object} query    Stats query
 * @param  {Array|Object}  data     Stat Data
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

export function receiveAllSitesStats( statType, query, data, date ) {
	return {
		type: ALL_SITES_STATS_RECEIVE,
		statType,
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
				case 'statsEmailsSummary':
					return {
						period: PERIOD_ALL_TIME,
						quantity: query.quantity ?? 10,
						sort_field: query.sort_field ?? 'post_date',
						sort_order: query.sort_order ?? 'desc',
					};
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

export function requestAllSiteStats( statType, query ) {
	const siteId = ALL_SITES_ID;
	return ( dispatch ) => {
		dispatch( {
			type: SITE_STATS_REQUEST,
			statType,
			siteId,
			query,
		} );

		let path;
		let apiNamespace;
		if ( wpcomV2AllSitesEndpoints.hasOwnProperty( statType ) ) {
			path = wpcomV2AllSitesEndpoints[ statType ];
			apiNamespace = 'wpcom/v2';
		}

		if ( ! path ) {
			return;
		}

		const requestStats = ( extraOptions ) =>
			wpcom.req.get(
				{
					path,
					apiNamespace,
				},
				{ ...query, ...extraOptions }
			);

		const MAX_RECURSION_DEPTH = 50; // Shouldn't be needed; but a failsafe to make sure we don't DDOS ourselves after an endpoint bug.

		const fetchPage = ( extraOptions, depth = 0 ) =>
			requestStats( extraOptions )
				.then( ( data ) => {
					let dispatchedStatType = statType;
					if ( statType === 'allSitesStatsSummary' ) {
						dispatchedStatType = 'statsSummary';
					}
					dispatch( receiveAllSitesStats( dispatchedStatType, query, data, Date.now() ) );
					if (
						data.has_more &&
						data.next_site_offset &&
						data.next_site_limit &&
						depth < MAX_RECURSION_DEPTH
					) {
						return fetchPage(
							{
								...extraOptions,
								site_offset: data.next_site_offset,
								site_limit: data.next_site_limit,
							},
							depth + 1
						);
					}
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
		return fetchPage( query );
	};
}
