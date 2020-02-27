/**
 * Internal dependencies
 */
import {
	AuthOptionsSuccessResponse,
	AuthOptionsErrorResponse,
	WpLoginSuccessResponse,
	WpLoginErrorResponse,
} from './types';

export const reset = () =>
	( {
		type: 'RESET_LOGIN_FLOW' as const,
	} as const );

export const receiveAuthOptions = (
	response: AuthOptionsSuccessResponse,
	usernameOrEmail: string
) =>
	( {
		type: 'RECEIVE_AUTH_OPTIONS',
		response,
		usernameOrEmail,
	} as const );

export const receiveAuthOptionsFailed = ( response: AuthOptionsErrorResponse ) =>
	( {
		type: 'RECEIVE_AUTH_OPTIONS_FAILED',
		response,
	} as const );

export const fetchAuthOptions = ( usernameOrEmail: string ) => ( {
	type: 'FETCH_AUTH_OPTIONS',
	usernameOrEmail,
} );

export function* submitUsernameOrEmail( usernameOrEmail: string ) {
	try {
		const authOptions = yield fetchAuthOptions( usernameOrEmail );

		yield receiveAuthOptions( authOptions, usernameOrEmail );
	} catch ( err ) {
		yield receiveAuthOptionsFailed( err );
	}
}

export const recieveWpLogin = ( response: WpLoginSuccessResponse ) =>
	( {
		type: 'RECEIVE_WP_LOGIN',
		response,
	} as const );

export const recieveWpLoginFailed = ( response: WpLoginErrorResponse ) =>
	( {
		type: 'RECEIVE_WP_LOGIN_FAILED',
		response,
	} as const );

export const wpLogin = ( action: string, params: object ) =>
	( {
		type: 'WP_LOGIN',
		action,
		params,
	} as const );

export function* submitPassword( password: string ) {
	const username = yield { type: 'SELECT_USERNAME_OR_EMAIL' };

	try {
		const loginResponse = yield wpLogin( 'login-endpoint', { username, password } );

		yield recieveWpLogin( loginResponse );
	} catch ( err ) {
		yield recieveWpLoginFailed( err );
	}
}

export type Action =
	| ReturnType<
			| typeof reset
			| typeof receiveAuthOptions
			| typeof receiveAuthOptionsFailed
			| typeof recieveWpLogin
			| typeof recieveWpLoginFailed
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
