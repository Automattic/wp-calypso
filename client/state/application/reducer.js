/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	CONNECTION_LOST,
	CONNECTION_RESTORED,
	SERIALIZE,
	DESERIALIZE
} from 'state/action-types';

export function connectionState( state = 'CHECKING', action ) {
	switch ( action.type ) {
		case CONNECTION_LOST:
			return 'OFFLINE';
		case CONNECTION_RESTORED:
			return 'ONLINE';
		case SERIALIZE:
			return 'CHECKING';
		case DESERIALIZE:
			return 'CHECKING';
	}

	return state;
}

export default combineReducers( {
	connectionState
} );
