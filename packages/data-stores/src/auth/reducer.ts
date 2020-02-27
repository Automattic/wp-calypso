/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { LoginFlowState } from './types';
import { Action } from './actions';

export const loginFlowState: Reducer< LoginFlowState, Action > = (
	state = 'ENTER_USERNAME_OR_EMAIL',
	action
) => {
	switch ( action.type ) {
		case 'RESET_LOGIN_FLOW':
			return 'ENTER_USERNAME_OR_EMAIL';

		case 'RECEIVE_AUTH_OPTIONS':
			if ( ! action.response.passwordless ) {
				return 'ENTER_PASSWORD';
			}
			return state;

		case 'RECEIVE_WP_LOGIN':
			return 'LOGGED_IN';

		default:
			return state;
	}
};

const usernameOrEmail: Reducer< string, Action > = ( state = '', action ) => {
	switch ( action.type ) {
		case 'RESET_LOGIN_FLOW':
			return '';

		case 'RECEIVE_AUTH_OPTIONS':
			return action.usernameOrEmail;

		default:
			return state;
	}
};

const password: Reducer< string, Action > = ( state = '', action ) => {
	switch ( action.type ) {
		case 'RESET_LOGIN_FLOW':
			return '';
		default:
			return state;
	}
};

export const credentials = combineReducers( { usernameOrEmail, password } );

const reducer = combineReducers( { loginFlowState, credentials } );

export type State = ReturnType< typeof reducer >;

export default reducer;
