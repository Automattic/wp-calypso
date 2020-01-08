/**
 * Internal dependencies
 */
import { COMPONENTS_USAGE_STATS_REQUEST, COMPONENTS_USAGE_STATS_RECEIVE } from 'state/action-types';

/**
 * Return an action object to signaling that the "usage stats" have been requested
 * @returns {object} Action object
 */
export function requestComponentsUsageStats() {
	return {
		type: COMPONENTS_USAGE_STATS_REQUEST,
	};
}

/**
 * Return an action object to signaling that the "usage stats" have been requested
 * @param {object} componentsUsageStats Parsed JSON for the usage stats
 * @returns {object} 					Action object
 */
export function receiveComponentsUsageStats( componentsUsageStats ) {
	return {
		type: COMPONENTS_USAGE_STATS_RECEIVE,
		componentsUsageStats,
	};
}

/**
 * Triggers a network request to request the components usage stats
 * @returns {Function} Action thunk
 */
export default function fetchComponentsUsageStats() {
	return dispatch => {
		dispatch( requestComponentsUsageStats() );
		return fetch( '/devdocs/service/components-usage-stats' )
			.then( async response => {
				if ( ! response.ok ) {
					return;
				}
				dispatch( receiveComponentsUsageStats( await response.json() ) );
			} )
			.catch( () => {
				// Do nothing.
			} );
	};
}
