/**
 * External dependencies
 */
import { Reducer } from 'redux';
import { combineReducers } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { ActionType, CurrentUser, NewUser } from './types';
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

const newUser: Reducer< NewUser | undefined, ReturnType< typeof Actions[ 'receiveNewUser' ] > > = (
	state = undefined,
	action
) => {
	if ( action.type === ActionType.RECEIVE_NEW_USER ) {
		const { response } = action;
		return {
			username: response.signup_sandbox_username || response.username,
			userId: response.signup_sandbox_user_id || response.user_id,
			bearerToken: response.bearer_token,
		};
	}
	return state;
};

const reducer = combineReducers( { currentUser, newUser } );

export type State = ReturnType< typeof reducer >;

export default reducer;
