/**
 * External dependencies
 */
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { CurrentUser, NewUser, NewUserErrorResponse } from './types';

type Action = import('./actions').Action;

function currentUser( state: CurrentUser | null | undefined, action: Action ) {
	switch ( action.type ) {
		case 'RECEIVE_CURRENT_USER':
			return action.currentUser;
		case 'RECEIVE_CURRENT_USER_FAILED':
			return null;
	}
	return state;
}

function newUserData( state: NewUser | undefined, action: Action ) {
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
}

function newUserError( state: NewUserErrorResponse | undefined, action: Action ) {
	switch ( action.type ) {
		case 'FETCH_NEW_USER':
			return undefined;
		case 'RECEIVE_NEW_USER':
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
}

function isFetchingNewUser( state = false, action: Action ) {
	switch ( action.type ) {
		case 'FETCH_NEW_USER':
			return true;
		case 'RECEIVE_NEW_USER':
			return false;
		case 'RECEIVE_NEW_USER_FAILED':
			return false;
	}
	return state;
}

const newUser = combineReducers( {
	data: newUserData,
	error: newUserError,
	isFetching: isFetchingNewUser,
} );

const reducer = combineReducers( { currentUser, newUser } );

export type State = ReturnType< typeof reducer >;

export default reducer;
