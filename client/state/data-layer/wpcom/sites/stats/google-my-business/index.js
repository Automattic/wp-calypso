/** @format */

/**
 * External dependencies
 */

import { noop, mapKeys, camelCase } from 'lodash';

/**
 * Internal dependencies
 */
import { GOOGLE_MY_BUSINESS_STATS_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveGoogleMyBusinessStats } from 'state/google-my-business/actions';

export const fromApi = data => mapKeys( data, ( value, key ) => camelCase( key ) );

export const fetchGoogleMyBusinessStats = ( { dispatch }, action ) => {
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

export default {
	[ GOOGLE_MY_BUSINESS_STATS_REQUEST ]: [
		dispatchRequest( fetchGoogleMyBusinessStats, receiveStats, noop ),
	],
};
