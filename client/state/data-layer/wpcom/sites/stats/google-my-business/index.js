/** @format */

/**
 * External dependencies
 */

import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import { GOOGLE_MY_BUSINESS_STATS_SEARCH_REQUEST } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { receiveGoogleMyBusinessStatsSearch } from 'state/users/actions';

export const fetchGoogleMyBusinessStatsSearch = ( { dispatch }, action ) => {
	const { siteId, timeSpan = 'week' } = action;
	dispatch(
		http(
			{
				path: `/sites/${ siteId }/google-my-business/search`,
				method: 'GET',
				apiNamespace: 'wp/v1',
				query: {
					time_span: timeSpan,
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
export const receiveSuccess = ( { dispatch }, action, data ) => {
	console.log( data );
};

export default {
	[ GOOGLE_MY_BUSINESS_STATS_SEARCH_REQUEST ]: [
		dispatchRequest( fetchGoogleMyBusinessStatsSearch, receiveSuccess, noop ),
	],
};
