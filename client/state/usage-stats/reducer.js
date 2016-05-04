/**
 * Internal dependencies
 */
import {
	USAGE_STATS_REQUEST,
	USAGE_STATS_RECEIVE
} from '../action-types';

/**
 * Tracks usage stats fetching state
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export default function usageStats( state = {
	isFetching: false,
	usageStats: {}
}, action ) {
	switch ( action.type ) {
		case USAGE_STATS_REQUEST:
			return Object.assign( {}, state, {
				isFetching: true
			} );
		case USAGE_STATS_RECEIVE:
			return Object.assign( {}, state, {
				isFetching: false,
				usageStats: action.usageStats
			} );
		default:
			return state;
	}
}
