/**
 * External dependencies
 */
import { select } from '@wordpress/data-controls';

/**
 * Internal dependencies
 */
import {
	AuthOptionsSuccessResponse,
	AuthOptionsErrorResponse,
	WpLoginSuccessResponse,
	WpLoginErrorResponse,
	SendLoginEmailSuccessResponse,
	SendLoginEmailErrorResponse,
} from './types';
import { STORE_KEY } from './constants';
import { wpcomRequest } from '../wpcom-request-controls';

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

export const receiveSendLoginEmail = ( response: SendLoginEmailSuccessResponse ) =>
	( {
		type: 'RECEIVE_SEND_LOGIN_EMAIL',
		response,
	} as const );

export const receiveSendLoginEmailFailed = ( response: SendLoginEmailErrorResponse ) =>
	( {
		type: 'RECEIVE_SEND_LOGIN_EMAIL_FAILED',
		response,
	} as const );

export const clearErrors = () =>
	( {
		type: 'CLEAR_ERRORS',
	} as const );

export interface SendLoginEmailAction {
	type: 'SEND_LOGIN_EMAIL';
	email: string;
}

const sendLoginEmail = ( email: string ): SendLoginEmailAction => ( {
	type: 'SEND_LOGIN_EMAIL',
	email,
} );

export function* submitUsernameOrEmail( usernameOrEmail: string ) {
	yield clearErrors();
	const escaped = encodeURIComponent( usernameOrEmail );

	try {
		const authOptions = yield wpcomRequest( {
			path: `/users/${ escaped }/auth-options`,
			apiVersion: '1.1',
		} );

		yield receiveAuthOptions( authOptions, usernameOrEmail );

		if ( authOptions.passwordless ) {
			try {
				const emailResponse: SendLoginEmailSuccessResponse = yield sendLoginEmail(
					usernameOrEmail
				);
				yield receiveSendLoginEmail( emailResponse );
			} catch ( err ) {
				yield receiveSendLoginEmailFailed( err );
			}
		}
	} catch ( err ) {
		yield receiveAuthOptionsFailed( err );
	}
}

export const receiveWpLogin = ( response: WpLoginSuccessResponse ) =>
	( {
		type: 'RECEIVE_WP_LOGIN',
		response,
	} as const );

export const receiveWpLoginFailed = ( response: WpLoginErrorResponse ) =>
	( {
		type: 'RECEIVE_WP_LOGIN_FAILED',
		response,
	} as const );

type WpLoginAction = 'login-endpoint' | 'two-step-authentication-endpoint';

const fetchWpLogin = ( action: WpLoginAction, params: object ) =>
	( {
		type: 'FETCH_WP_LOGIN',
		action,
		params,
	} as const );

export type FetchWpLoginAction = ReturnType< typeof fetchWpLogin >;

const remoteLoginUser = ( loginLinks: string[] ) =>
	( {
		type: 'REMOTE_LOGIN_USER',
		loginLinks,
	} as const );

export type RemoteLoginUserAction = ReturnType< typeof remoteLoginUser >;

export function* submitPassword( password: string ) {
	yield clearErrors();
	const username = yield select( STORE_KEY, 'getUsernameOrEmail' );

	try {
		const loginResponse = yield fetchWpLogin( 'login-endpoint', { username, password } );

		if ( loginResponse.ok && loginResponse.body.success ) {
			yield remoteLoginUser( loginResponse.body.data.token_links );
			yield receiveWpLogin( loginResponse.body );
		} else {
			yield receiveWpLoginFailed( loginResponse.body );
		}
	} catch ( e ) {
		const error = {
			code: e.name,
			message: e.message,
		};

		yield receiveWpLoginFailed( {
			success: false,
			data: { errors: [ error ] },
		} );
	}
}

export type Action =
	| ReturnType<
			| typeof reset
			| typeof clearErrors
			| typeof receiveAuthOptions
			| typeof receiveAuthOptionsFailed
			| typeof receiveWpLogin
			| typeof receiveWpLoginFailed
			| typeof receiveSendLoginEmail
			| typeof receiveSendLoginEmailFailed
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };

export const publicActions = {
	reset,
	submitUsernameOrEmail,
	submitPassword,
};
