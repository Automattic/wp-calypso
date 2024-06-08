import { combineReducers } from '@wordpress/data';
import type { Action } from './actions';
import type { AuthRedirectParams, CurrentUser } from './types';
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

export const authRedirectParams: Reducer< AuthRedirectParams | null | undefined, Action > = (
	state,
	action
) => {
	switch ( action.type ) {
		case 'RECEIVE_AUTH_REDIRECT':
			return action.authRedirectParams;
	}
	return state;
};

const reducer = combineReducers( { currentUser, authRedirectParams } );
export type State = ReturnType< typeof reducer >;

export default reducer;
