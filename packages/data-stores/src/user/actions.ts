/**
 * Internal dependencies
 */
import {
	CurrentUser,
	CreateAccountParams,
	NewUserErrorResponse,
	NewUserSuccessResponse,
} from './types';

import { wpcomRequest } from '../wpcom-request-controls';

export const fetchCurrentUser = () =>
	wpcomRequest( {
		path: '/me',
		apiVersion: '1.1',
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

export function* createAccount( params: CreateAccountParams ) {
	yield fetchNewUser();
	try {
		const { body, ...restParams } = params as { body?: object };
		const newUser = yield wpcomRequest( {
			// defaults
			body: {
				is_passwordless: true,
				signup_flow_name: 'gutenboarding',
				locale: 'en',
				...body,
			},
			path: '/users/new',
			apiVersion: '1.1',
			method: 'post',

			...restParams,

			// Set to false because account validation should be a separate action
			validate: false,
		} );
		return receiveNewUser( newUser );
	} catch ( err ) {
		yield receiveNewUserFailed( err );

		return false;
	}
}

export type Action = ReturnType<
	| typeof fetchCurrentUser
	| typeof receiveCurrentUser
	| typeof receiveCurrentUserFailed
	| typeof fetchNewUser
	| typeof receiveNewUser
	| typeof receiveNewUserFailed
>;
