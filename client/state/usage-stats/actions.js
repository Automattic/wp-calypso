/**
 * Internal dependencies
 */
import {
	USAGE_STATS_REQUEST,
	USAGE_STATS_RECEIVE
} from '../action-types';
import request from 'superagent';

/**
 * Return an action object to signaling that the "usage stats" have been requested
 * @return {Object} Action object
 */
export function requestUsageStats() {
	return {
		type: USAGE_STATS_REQUEST
	};
}

/**
 * Return an action object to signaling that the "usage stats" have been requested
 * @param {Object} usageStats Parsed JSON for the usage stats
 * @return {Object} 					Action object
 */
export function receiveUsageStats( usageStats ) {
	return {
		type: USAGE_STATS_RECEIVE,
		usageStats
	};
}

/**
 * Triggers a network request to request the components usage stats
 * @returns {Function} Action thunk
 */
export default function fetchUsageStats() {
	return dispatch => {
		dispatch( requestUsageStats() );
		return request
			.get( '/devdocs/service/usage-stats' )
			.end( ( error, res ) => {
				if ( ! res.ok ) {
					return;
				}
				dispatch( receiveUsageStats( res.body ) );
			} );
	};
}
