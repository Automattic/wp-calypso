/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, CurrentUser, NewUser, NewUserErrorResponse } from './types';
import { Action } from './actions';

const currentUser: Reducer< CurrentUser | null | undefined, Action > = ( state, action ) => {
	switch ( action.type ) {
		case ActionType.RECEIVE_CURRENT_USER:
			return action.currentUser;
		case ActionType.RECEIVE_CURRENT_USER_FAILED:
			return null;
	}
	return state;
};

const newUserData: Reducer< NewUser | undefined, Action > = ( state, action ) => {
	if ( action.type === ActionType.RECEIVE_NEW_USER ) {
		const { response } = action;
		return {
			username: response.signup_sandbox_username || response.username,
			userId: response.signup_sandbox_user_id || response.user_id,
			bearerToken: response.bearer_token,
		};
	} else if ( action.type === ActionType.RECEIVE_NEW_USER_FAILED ) {
		return undefined;
	}
	return state;
};

const newUserError: Reducer< NewUserErrorResponse | undefined, Action > = ( state, action ) => {
	switch ( action.type ) {
		case ActionType.FETCH_NEW_USER:
			return undefined;
		case ActionType.RECEIVE_NEW_USER:
			return undefined;
		case ActionType.RECEIVE_NEW_USER_FAILED:
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

const isFetchingNewUser: Reducer< boolean | undefined, Action > = ( state = false, action ) => {
	switch ( action.type ) {
		case ActionType.FETCH_NEW_USER:
			return true;
		case ActionType.RECEIVE_NEW_USER:
			return false;
		case ActionType.RECEIVE_NEW_USER_FAILED:
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
