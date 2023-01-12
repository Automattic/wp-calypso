import wpcom from 'calypso/lib/wp';
import {
	EMAIL_STATS_RECEIVE,
	EMAIL_STATS_REQUEST,
	EMAIL_STATS_REQUEST_FAILURE,
	EMAIL_STATS_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import {
	parseEmailChartData,
	parseEmailCountriesData,
	parseEmailListData,
} from 'calypso/state/stats/lists/utils';

import 'calypso/state/stats/init';

/**
 * Returns an action object to be used in signalling that email stat for a site,
 * email, period and stat have been received.
 *
 * @param  {number} siteId Site ID
 * @param  {number} postId Email Id
 * @param  {string} period Unit for each element of the returned array (ie: 'year', 'month', ...)
 * @param  {string} statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @param  {string?} date A date in YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
 * @param  {object}  stats  The received stats
 * @returns {object}        Action object
 */
export function receiveEmailStats( siteId, postId, period, statType, date, stats ) {
	return {
		type: EMAIL_STATS_RECEIVE,
		siteId,
		postId,
		period,
		statType,
		date,
		stats,
	};
}

/**
 * Transforms the received API response to Redux state
 *
 * @param {object} stats The incoming stats
 * @param {string} period The period for the stats
 * @returns {object}
 */
function emailOpenStatsPeriodTransform( stats, period ) {
	const emailChartData = parseEmailChartData( stats.timeline, [] );

	// create an object from emailStats with period as the key
	return emailChartData.reduce( ( obj, item ) => {
		const filter = 'hour' === period ? item.labelHour : item.period;

		obj[ filter ] = {
			chart: item,
		};
		return obj;
	}, {} );
}

/**
 * Transforms the received API response to Redux state
 *
 * @param {object} stats The incoming stats
 * @returns {object}
 */
function emailOpenStatsAlltimeTransform( stats ) {
	return {
		countries: parseEmailCountriesData( stats.countries?.data, stats[ 'countries-info' ] ),
		devices: parseEmailListData( stats.devices?.data ),
		clients: parseEmailListData( stats.clients?.data ),
		rate: {
			opens_rate: stats.opens_rate,
			total_opens: stats.total_opens,
			total_sends: stats.total_sends,
		},
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve email stat for a site and a post.
 *
 * @param  {number} siteId Site ID
 * @param  {number} postId Email Id
 * @param  {string} period Unit for each element of the returned array (ie: 'year', 'month', ...)
 * @param  {string?} date A date in YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
 * @param  {number} quantity The number of elements retrieved in the array
 */
function requestEmailOpensStats( siteId, postId, period, date, quantity ) {
	return ( dispatch ) => {
		dispatch( {
			type: EMAIL_STATS_REQUEST,
			postId,
			siteId,
			period,
			date,
			statType: 'opens',
		} );

		// set defaults for year and hour
		const queryQuantity = ( () => {
			if ( period === 'year' ) {
				return 10;
			}
			if ( period === 'hour' ) {
				return 24;
			}
			return quantity;
		} )();

		const query = period === 'alltime' ? {} : { period, quantity: queryQuantity, date };

		const site = wpcom.site( siteId );
		const statsPromise =
			period === 'alltime'
				? site.statsEmailOpensAlltime( postId )
				: site.statsEmailOpensForPeriod( postId, query );

		return statsPromise
			.then( ( stats ) => {
				// create an object from emailStats with period as the key
				const emailStatsObject =
					period === 'alltime'
						? emailOpenStatsAlltimeTransform( stats )
						: emailOpenStatsPeriodTransform( stats, period );

				dispatch( receiveEmailStats( siteId, postId, period, 'opens', date, emailStatsObject ) );

				dispatch( {
					type: EMAIL_STATS_REQUEST_SUCCESS,
					siteId,
					postId,
					date,
				} );
			} )
			.catch( ( error ) => {
				dispatch( {
					type: EMAIL_STATS_REQUEST_FAILURE,
					siteId,
					postId,
					period,
					statType: 'opens',
					date,
					error,
				} );
			} );
	};
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve email stat for a site, post, period and date
 *
 * This is for stats that are bound to a period (chart, clients, devices, countries)
 *
 * @param  {number} siteId Site ID
 * @param  {number} postId Email Id
 * @param  {string} period Unit for each element of the returned array (ie: 'year', 'month', ...)
 * @param  {string} date A date in YYYY-MM-DD or YYYY-MM-DDTHH:mm:ss format
 * @param  {string} statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @param  {number} quantity The number of elements retrieved in the array
 */
export function requestEmailPeriodStats( siteId, postId, period, date, statType, quantity = 30 ) {
	switch ( statType ) {
		case 'opens':
			// request stats bound by period ( chart, countries, devices & clients )
			return requestEmailOpensStats( siteId, postId, period, date, quantity );
	}
}

/**
 * Returns an action thunk which, when invoked, triggers a network request to
 * retrieve email stat for a site and a post.
 *
 * This is for stats that are not bound to a period (open_rate)
 *
 * @param  {number} siteId Site ID
 * @param  {number} postId Email Id
 * @param  {string} statType The type of stat we are working with. For example: 'opens' for Email Open stats
 * @param  {number} quantity The number of elements retrieved in the array
 */
export function requestEmailAlltimeStats( siteId, postId, statType, quantity = 30 ) {
	switch ( statType ) {
		case 'opens':
			// request stats bound by period ( chart, countries, devices & clients )
			return requestEmailOpensStats( siteId, postId, 'alltime', null, quantity );
	}
}
