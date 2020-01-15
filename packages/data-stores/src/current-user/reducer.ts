/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, CurrentUser } from './types';
import * as Actions from './actions';

const currentUser: Reducer<
	CurrentUser | undefined,
	| ReturnType< typeof Actions[ 'receiveCurrentUser' ] >
	| ReturnType< typeof Actions[ 'receiveCurrentUserFailed' ] >
> = ( state = undefined, action ) => {
	switch ( action.type ) {
		case ActionType.RECEIVE_CURRENT_USER:
			return action.currentUser;
		case ActionType.RECEIVE_CURRENT_USER_FAILED:
			return undefined;
	}
	return state;
};

const reducer = combineReducers( { currentUser } );

export type State = ReturnType< typeof reducer >;

export default reducer;
