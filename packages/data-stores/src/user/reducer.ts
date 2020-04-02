/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { CurrentUser, NewUser, NewUserErrorResponse, ValidatedUsername } from './types';
import { Action } from './actions';

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

export const validatedUsername: Reducer< ValidatedUsername | undefined, Action > = (
	state,
	action
) => {
	if ( action.type === 'RECEIVE_VALIDATED_USERNAME' ) {
		if ( action.response.success ) {
			return {
				username: action.username,
				isSuggested: false,
			};
		}
		if ( action.response.success === false && action.response.messages?.suggested_username?.data ) {
			return {
				username: action.response.messages.suggested_username.data,
				isSuggested: true,
			};
		}
	}
	if ( action.type === 'RECEIVE_VALIDATED_USERNAME_ERROR' ) {
		if ( action.response.suggested_username ) {
			return {
				username: action.response.suggested_username.data,
				isSuggested: true,
			};
		}
	}
	if ( action.type === 'CLEAR_VALIDATED_USERNAME' ) {
		return undefined;
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

const reducer = combineReducers( { currentUser, newUser, validatedUsername } );

export type State = ReturnType< typeof reducer >;

export default reducer;
