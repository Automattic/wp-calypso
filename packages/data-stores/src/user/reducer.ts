import { combineReducers } from '@wordpress/data';
import type { Action } from './actions';
import type { CurrentUser, NewUser, NewUserErrorResponse } from './types';
import type { Reducer } from 'redux';

export const currentUser: Reducer< CurrentUser | null | undefined, Action > = ( state, action ) => {
	switch ( action.type ) {
		case 'RECEIVE_CURRENT_USER':
			return action.currentUser;
		case 'RECEIVE_CURRENT_USER_FAILED':
			return null;
	}
	return state;
};

export const newUserData: Reducer< NewUser | undefined, Action > = ( state, action ) => {
	if ( action.type === 'RECEIVE_NEW_USER' ) {
		const { response } = action;
		return {
			username: response.signup_sandbox_username || response.username,
			userId: response.signup_sandbox_user_id || response.user_id,
			bearerToken: response.bearer_token,
		};
	} else if ( action.type === 'RECEIVE_NEW_USER_FAILED' ) {
		return undefined;
	}
	return state;
};

export const newUserError: Reducer< NewUserErrorResponse | undefined, Action > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'FETCH_NEW_USER':
			return undefined;
		case 'RECEIVE_NEW_USER':
			return undefined;
		case 'CLEAR_ERRORS':
			return undefined;
		case 'RECEIVE_NEW_USER_FAILED':
			return {
				error: action.error.error,
				status: action.error.status,
				statusCode: action.error.statusCode,
				name: action.error.name,
				message: action.error.message,
			};
	}
	return state;
};

export const isFetchingNewUser: Reducer< boolean | undefined, Action > = (
	state = false,
	action
) => {
	switch ( action.type ) {
		case 'FETCH_NEW_USER':
			return true;
		case 'RECEIVE_NEW_USER':
			return false;
		case 'RECEIVE_NEW_USER_FAILED':
			return false;
	}
	return state;
};

const newUser = combineReducers( {
	data: newUserData,
	error: newUserError,
	isFetching: isFetchingNewUser,
} );

const reducer = combineReducers( { currentUser, newUser } );

export type State = ReturnType< typeof reducer >;

export default reducer;
