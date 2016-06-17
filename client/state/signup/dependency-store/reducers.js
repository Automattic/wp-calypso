/**
 * External dependencies
 */
import { combineReducers } from 'redux';

/**
 * Internal dependencies
 */
import {
	SIGNUP_DEPENDENCY_STORE_RESET,
	SIGNUP_DEPENDENCY_STORE_UPDATE_STATE,
} from 'state/action-types';

export function storeState( state = null, action ) {
	switch ( action.type ) {
		case SIGNUP_DEPENDENCY_STORE_UPDATE_STATE:
			return Object.assign( {}, state, action.data );

		case SIGNUP_DEPENDENCY_STORE_RESET:
			return {};
	}

	return state;
}

export default combineReducers( {
	storeState
} );
