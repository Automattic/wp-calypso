/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { CONNECTION_LOST, CONNECTION_RESTORED } from 'state/action-types';

export function isOnline( state = 'CHECKING', action ) {
	switch ( action.type ) {
		case CONNECTION_LOST:
			state = 'OFFLINE';
			break;
		case CONNECTION_RESTORED:
			state = 'ONLINE';
			break;
	}

	return state;
}

export default combineReducers( {
	isOnline
} );
