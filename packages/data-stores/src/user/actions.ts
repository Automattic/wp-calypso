/**
 * Internal dependencies
 */
import {
	ActionType,
	CurrentUser,
	CreateAccountParams,
	NewUserErrorResponse,
	NewUserSuccessResponse,
} from './types';

export const fetchCurrentUser = () => ( {
	type: ActionType.FETCH_CURRENT_USER as const,
} );

export const receiveCurrentUser = ( currentUser: CurrentUser ) => ( {
	type: ActionType.RECEIVE_CURRENT_USER as const,
	currentUser,
} );

export const receiveCurrentUserFailed = () => ( {
	type: ActionType.RECEIVE_CURRENT_USER_FAILED as const,
} );

export const fetchNewUser = () => ( {
	type: ActionType.FETCH_NEW_USER as const,
} );

export const receiveNewUser = ( response: NewUserSuccessResponse ) => ( {
	type: ActionType.RECEIVE_NEW_USER as const,
	response,
} );

export const receiveNewUserFailed = ( error: NewUserErrorResponse ) => ( {
	type: ActionType.RECEIVE_NEW_USER_FAILED as const,
	error,
} );

export function* createAccount( params: CreateAccountParams ) {
	yield fetchNewUser();
	try {
		const newUser = yield {
			type: ActionType.CREATE_ACCOUNT as const,
			params,
		};
		return receiveNewUser( newUser );
	} catch ( err ) {
		return receiveNewUserFailed( err );
	}
}
