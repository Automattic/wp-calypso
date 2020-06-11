/**
 * External dependencies
 */
import type { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import type { LoginFlowState } from './types';
import type { Action } from './actions';
import { getNextTaskId } from './utils';

export const loginFlowState: Reducer< LoginFlowState, Action > = (
	state = 'ENTER_USERNAME_OR_EMAIL',
	action
) => {
	switch ( action.type ) {
		case 'RESET_LOGIN_FLOW':
			return 'ENTER_USERNAME_OR_EMAIL';

		case 'RECEIVE_AUTH_OPTIONS_FAILED':
			return 'ENTER_USERNAME_OR_EMAIL';

		case 'RECEIVE_AUTH_OPTIONS':
			if ( ! action.response.passwordless ) {
				return 'ENTER_PASSWORD';
			}
			return state;

		case 'RECEIVE_WP_LOGIN':
			if ( action.response.data.two_step_notification_sent ) {
				return 'WAITING_FOR_2FA_APP';
			}
			return 'LOGGED_IN';

		case 'RECEIVE_WP_LOGIN_FAILED':
			if ( state === 'WAITING_FOR_2FA_APP' ) {
				return 'ENTER_PASSWORD';
			}
			return state;

		case 'RECEIVE_SEND_LOGIN_EMAIL':
			if ( action.response.success ) {
				return 'LOGIN_LINK_SENT';
			}
			return state;

		default:
			return state;
	}
};

export const usernameOrEmail: Reducer< string, Action > = ( state = '', action ) => {
	switch ( action.type ) {
		case 'RESET_LOGIN_FLOW':
			return '';

		case 'RECEIVE_AUTH_OPTIONS':
			return action.usernameOrEmail;

		default:
			return state;
	}
};

export interface ErrorObject {
	code: string;
	message: string;
}

export const errors: Reducer< ErrorObject[], Action > = ( state = [], action ) => {
	switch ( action.type ) {
		case 'RESET_LOGIN_FLOW':
		case 'CLEAR_ERRORS':
			return [];

		case 'RECEIVE_WP_LOGIN_FAILED':
			return action.response.data.errors;

		case 'RECEIVE_AUTH_OPTIONS_FAILED':
		case 'RECEIVE_SEND_LOGIN_EMAIL_FAILED':
			return [
				{
					code: action.response.error,
					message: action.response.message,
				},
			];

		default:
			return state;
	}
};

const pollingTaskId: Reducer< number, Action > = ( state = getNextTaskId(), action ) => {
	switch ( action.type ) {
		case 'RESET_LOGIN_FLOW':
			return getNextTaskId();
		case 'START_POLLING_TASK':
			return action.pollingTaskId;
		default:
			return state;
	}
};

const reducer = combineReducers( { errors, loginFlowState, usernameOrEmail, pollingTaskId } );

export type State = ReturnType< typeof reducer >;

export default reducer;
