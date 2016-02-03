/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { CURRENT_USER_ID_SET, SERIALIZE, DESERIALIZE } from 'state/action-types';

/**
 * Tracks the current user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function id( state = null, action ) {
	switch ( action.type ) {
		case CURRENT_USER_ID_SET:
			state = action.userId;
			break;
		case SERIALIZE:
			return state;
		case DESERIALIZE:
			return state;
	}

	return state;
}

export default combineReducers( {
	id
} );
