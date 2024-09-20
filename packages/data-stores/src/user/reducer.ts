import { combineReducers } from '@wordpress/data';
import type { Action } from './actions';
import type { CurrentUser } from './types';
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

const isNewUser: Reducer< boolean, Action > = ( state = false, action ) => {
	switch ( action.type ) {
		case 'SET_IS_NEW_USER':
			return action.isNewUser;
	}
	return state;
};

const reducer = combineReducers( { currentUser, isNewUser } );
export type State = ReturnType< typeof reducer >;

export default reducer;
