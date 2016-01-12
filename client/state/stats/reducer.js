/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	RECEIVE_SITE_STATS
} from 'state/action-types';

export function items( state = [], action ) {
	switch ( action.type ) {
		case RECEIVE_SITE_STATS:
			state = [ action.siteStat, ...state ];
			break;
	}
	return state;
}

export default combineReducers( {
	items
} );
