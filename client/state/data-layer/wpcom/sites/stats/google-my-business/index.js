/**
 * Internal dependencies
 */
import { convertToCamelCase } from 'state/data-layer/utils';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { GOOGLE_MY_BUSINESS_STATS_REQUEST } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	receiveGoogleMyBusinessStats,
	failedRequestGoogleMyBusinessStats,
} from 'state/google-my-business/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetchStats = ( action ) => {
	const { siteId, statType, interval = 'week', aggregation = 'total' } = action;

	return http(
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
 * @param {object} action Redux action
 * @param {Array} data raw data from stats API
 * @returns {object} action Redux action
 */
export const receiveStats = ( action, data ) => {
	const { siteId, statType, interval, aggregation } = action;

	return receiveGoogleMyBusinessStats( siteId, statType, interval, aggregation, data );
};

/**
 * Dispatches a failure to retrieve stats
 *
 * @param {object} action Redux action
 * @param {object} error raw error from stats API
 * @returns {object} action Redux action
 */
export const receiveStatsError = ( action, error ) => {
	const { siteId, statType, interval, aggregation } = action;

	return failedRequestGoogleMyBusinessStats( siteId, statType, interval, aggregation, error );
};

registerHandlers( 'state/data-layer/wpcom/sites/stats/google-my-business/index.js', {
	[ GOOGLE_MY_BUSINESS_STATS_REQUEST ]: [
		dispatchRequest( {
			fetch: fetchStats,
			onSuccess: receiveStats,
			onError: receiveStatsError,
			fromApi: convertToCamelCase,
		} ),
	],
} );
