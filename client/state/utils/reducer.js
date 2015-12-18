/**
 * External dependencies
 */
import { combineReducers } from 'redux';
import { UTILS_UNIQUEID_INCREMENT } from 'state/action-types';

export function uniqueId( state = 1, action ) {
	switch ( action.type ) {
		case UTILS_UNIQUEID_INCREMENT:
			state = state + 1;
			break;
	}

	return state;
}

export default combineReducers( {
	uniqueId
} );
