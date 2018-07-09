/** @format */

/**
 * Internal dependencies
 */
import { convertToCamelCase } from 'state/data-layer/utils';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { GOOGLE_MY_BUSINESS_STATS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receiveGoogleMyBusinessStats,
	failedRequestGoogleMyBusinessStats,
} from 'state/google-my-business/actions';

export const fromApi = data => convertToCamelCase( data );

export const fetchStats = action => {
	const { siteId, statType, interval = 'week', aggregation = 'total' } = action;

	http(
		{
			path: `/sites/${ siteId }/stats/google-my-business/${ statType }`,
			method: 'GET',
			query: {
				interval,
				aggregation,
			},
		},
		action
	);
};

/**
 * Dispatches returned stats
 *
 * @param {Object} action Redux action
 * @param {Array} data raw data from stats API
 */
export const receiveStats = ( action, data ) => {
	const { siteId, statType, interval, aggregation } = action;

	return receiveGoogleMyBusinessStats( siteId, statType, interval, aggregation, fromApi( data ) );
};

/**
 * Dispatches a failure to retrieve stats
 *
 * @param {Object} action Redux action
 * @param {Object} error raw error from stats API
 */
export const receiveStatsError = ( action, error ) => {
	const { siteId, statType, interval, aggregation } = action;

	return failedRequestGoogleMyBusinessStats( siteId, statType, interval, aggregation, error );
};

export default {
	[ GOOGLE_MY_BUSINESS_STATS_REQUEST ]: [
		dispatchRequestEx( {
			fetch: fetchStats,
			onSuccess: receiveStats,
			onError: receiveStatsError,
		} ),
	],
};
