/** @format */

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

export const fromApi = data => convertToCamelCase( data );

export const fetchStats = ( { dispatch }, action ) => {
	const { siteId, statType, interval = 'week', aggregation = 'total' } = action;

	dispatch(
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
		)
	);
};

/**
 * Dispatches returned stats
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {Array} data raw data from stats API
 */
export const receiveStats = ( { dispatch }, action, data ) => {
	const { siteId, statType, interval, aggregation } = action;

	dispatch(
		receiveGoogleMyBusinessStats( siteId, statType, interval, aggregation, fromApi( data ) )
	);
};

/**
 * Dispatches a failure to retrieve stats
 *
 * @param {Function} dispatch Redux dispatcher
 * @param {Object} action Redux action
 * @param {Object} error raw error from stats API
 */
export const receiveStatsError = ( { dispatch }, action, error ) => {
	const { siteId, statType, interval, aggregation } = action;

	dispatch( failedRequestGoogleMyBusinessStats( siteId, statType, interval, aggregation, error ) );
};

registerHandlers( 'state/data-layer/wpcom/sites/stats/google-my-business/index.js', {
	[ GOOGLE_MY_BUSINESS_STATS_REQUEST ]: [
		dispatchRequest( fetchStats, receiveStats, receiveStatsError ),
	],
} );
