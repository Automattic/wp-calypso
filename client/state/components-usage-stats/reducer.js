/**
 * Internal dependencies
 */
import {
	COMPONENTS_USAGE_STATS_REQUEST,
	COMPONENTS_USAGE_STATS_RECEIVE
} from '../action-types';

/**
 * Tracks usage stats fetching state
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export default function componentsUsageStats( state = {
	isFetching: false,
	componentsUsageStats: {}
}, action ) {
	switch ( action.type ) {
		case COMPONENTS_USAGE_STATS_REQUEST:
			return Object.assign( {}, state, {
				isFetching: true
			} );
		case COMPONENTS_USAGE_STATS_RECEIVE:
			return Object.assign( {}, state, {
				isFetching: false,
				componentsUsageStats: action.componentsUsageStats
			} );
		default:
			return state;
	}
}
