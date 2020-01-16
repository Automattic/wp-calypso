/**
 * Internal dependencies
 */
import { ActionType, CurrentUser, NewUserResponse, CreateAccountParams } from './types';

export const receiveCurrentUser = ( currentUser: CurrentUser ) => ( {
	type: ActionType.RECEIVE_CURRENT_USER as const,
	currentUser,
} );

export const receiveCurrentUserFailed = () => ( {
	type: ActionType.RECEIVE_CURRENT_USER_FAILED as const,
} );

export const receiveNewUser = ( response: NewUserResponse ) => {
	return {
		type: ActionType.RECEIVE_NEW_USER as const,
		response,
	};
};

export const receiveNewUserFailed = () => ( {
	type: ActionType.RECEIVE_NEW_USER_FAILED as const,
} );

export function* createAccount( params: CreateAccountParams ) {
	const newUser = yield {
		type: ActionType.CREATE_ACCOUNT as const,
		params,
	};
	if ( newUser ) {
		return receiveNewUser( newUser );
	}
	return receiveNewUserFailed();
}
