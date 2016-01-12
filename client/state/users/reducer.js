/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import { USER_RECEIVE } from 'state/action-types';

/**
 * Tracks all known user objects, indexed by user ID.
 *
 * @param  {Object} state  Current state
 * @param  {Object} action Action payload
 * @return {Object}        Updated state
 */
export function items( state = {}, action ) {
	switch ( action.type ) {
		case USER_RECEIVE:
			state = Object.assign( {}, state, {
				[ action.user.ID ]: action.user
			} );
			break;
	}

	return state;
}

export default combineReducers( {
	items
} );
