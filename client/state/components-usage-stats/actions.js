/**
 * Internal dependencies
 */
import {
	COMPONENTS_USAGE_STATS_REQUEST,
	COMPONENTS_USAGE_STATS_RECEIVE
} from '../action-types';
import request from 'superagent';

/**
 * Return an action object to signaling that the "usage stats" have been requested
 * @return {Object} Action object
 */
export function requestComponentsUsageStats() {
	return {
		type: COMPONENTS_USAGE_STATS_REQUEST
	};
}

/**
 * Return an action object to signaling that the "usage stats" have been requested
 * @param {Object} componentsUsageStats Parsed JSON for the usage stats
 * @return {Object} 					Action object
 */
export function receiveComponentsUsageStats( componentsUsageStats ) {
	return {
		type: COMPONENTS_USAGE_STATS_RECEIVE,
		componentsUsageStats
	};
}

/**
 * Triggers a network request to request the components usage stats
 * @returns {Function} Action thunk
 */
export default function fetchComponentsUsageStats() {
	return dispatch => {
		dispatch( requestComponentsUsageStats() );
		return request
			.get( '/devdocs/service/components-usage-stats' )
			.end( ( error, res ) => {
				if ( ! res.ok ) {
					return;
				}
				dispatch( receiveComponentsUsageStats( res.body ) );
			} );
	};
}
