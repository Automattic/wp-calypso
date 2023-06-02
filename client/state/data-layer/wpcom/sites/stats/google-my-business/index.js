import { GOOGLE_MY_BUSINESS_STATS_REQUEST } from 'calypso/state/action-types';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { convertToCamelCase } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	receiveGoogleMyBusinessStats,
	failedRequestGoogleMyBusinessStats,
} from 'calypso/state/google-my-business/actions';

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
 * @param {Object} action Redux action
 * @param {Array} data raw data from stats API
 * @returns {Object} action Redux action
 */
export const receiveStats = ( action, data ) => {
	const { siteId, statType, interval, aggregation } = action;

	return receiveGoogleMyBusinessStats( siteId, statType, interval, aggregation, data );
};

/**
 * Dispatches a failure to retrieve stats
 *
 * @param {Object} action Redux action
 * @param {Object} error raw error from stats API
 * @returns {Object} action Redux action
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

export default {};
