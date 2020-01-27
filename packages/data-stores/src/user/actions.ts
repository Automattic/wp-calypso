/**
 * Internal dependencies
 */
import {
	CurrentUser,
	CreateAccountParams,
	NewUserErrorResponse,
	NewUserSuccessResponse,
} from './types';

export const fetchCurrentUser = () => ( {
	type: 'FETCH_CURRENT_USER' as const,
} );

export const receiveCurrentUser = ( currentUser: CurrentUser ) => ( {
	type: 'RECEIVE_CURRENT_USER' as const,
	currentUser,
} );

export const receiveCurrentUserFailed = () => ( {
	type: 'RECEIVE_CURRENT_USER_FAILED' as const,
} );

export const fetchNewUser = () => ( {
	type: 'FETCH_NEW_USER' as const,
} );

export const receiveNewUser = ( response: NewUserSuccessResponse ) => ( {
	type: 'RECEIVE_NEW_USER' as const,
	response,
} );

export const receiveNewUserFailed = ( error: NewUserErrorResponse ) => ( {
	type: 'RECEIVE_NEW_USER_FAILED' as const,
	error,
} );

const createAccount = ( params: CreateAccountParams ) => ( {
	type: 'CREATE_ACCOUNT' as const,
	params,
} );

export function* runCreateAccount( params: CreateAccountParams ) {
	yield fetchNewUser();
	try {
		const newUser = yield createAccount( params );
		return receiveNewUser( newUser );
	} catch ( err ) {
		return receiveNewUserFailed( err );
	}
}

export type Action = ReturnType<
	| typeof fetchCurrentUser
	| typeof receiveCurrentUser
	| typeof receiveCurrentUserFailed
	| typeof fetchNewUser
	| typeof receiveNewUser
	| typeof receiveNewUserFailed
	| typeof createAccount
>;
