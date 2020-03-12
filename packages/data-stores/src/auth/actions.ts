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
import { fetchWpLogin, reloadProxy, remoteLoginUser } from './controls';
import { WpcomClientCredentials } from '../shared-types';

export interface ActionsConfig extends WpcomClientCredentials {
	/**
	 * True if user needs immediate access to cookies after logging in.
	 * See README.md for details.
	 * Default: true
	 */
	loadCookiesAfterLogin?: boolean;
}

export function createActions( {
	client_id,
	client_secret,
	loadCookiesAfterLogin = true,
}: ActionsConfig ) {
	const reset = () =>
		( {
			type: 'RESET_LOGIN_FLOW' as const,
		} as const );

	const receiveAuthOptions = ( response: AuthOptionsSuccessResponse, usernameOrEmail: string ) =>
		( {
			type: 'RECEIVE_AUTH_OPTIONS',
			response,
			usernameOrEmail,
		} as const );

	const receiveAuthOptionsFailed = ( response: AuthOptionsErrorResponse ) =>
		( {
			type: 'RECEIVE_AUTH_OPTIONS_FAILED',
			response,
		} as const );

	const receiveSendLoginEmail = ( response: SendLoginEmailSuccessResponse ) =>
		( {
			type: 'RECEIVE_SEND_LOGIN_EMAIL',
			response,
		} as const );

	const receiveSendLoginEmailFailed = ( response: SendLoginEmailErrorResponse ) =>
		( {
			type: 'RECEIVE_SEND_LOGIN_EMAIL_FAILED',
			response,
		} as const );

	const clearErrors = () =>
		( {
			type: 'CLEAR_ERRORS',
		} as const );

	function* submitUsernameOrEmail( usernameOrEmail: string ) {
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
					const emailResponse = yield wpcomRequest( {
						path: `/auth/send-login-email`,
						apiVersion: '1.2',
						method: 'post',
						body: {
							email: usernameOrEmail,

							// TODO Send the correct locale
							lang_id: 1,
							locale: 'en',

							client_id,
							client_secret,
						},
					} );

					yield receiveSendLoginEmail( emailResponse );
				} catch ( err ) {
					yield receiveSendLoginEmailFailed( err );
				}
			}
		} catch ( err ) {
			yield receiveAuthOptionsFailed( err );
		}
	}

	const receiveWpLogin = ( response: WpLoginSuccessResponse ) =>
		( {
			type: 'RECEIVE_WP_LOGIN',
			response,
		} as const );

	const receiveWpLoginFailed = ( response: WpLoginErrorResponse ) =>
		( {
			type: 'RECEIVE_WP_LOGIN_FAILED',
			response,
		} as const );

	function* submitPassword( password: string ) {
		yield clearErrors();
		const username = yield select( STORE_KEY, 'getUsernameOrEmail' );

		try {
			const loginResponse = yield fetchWpLogin( 'login-endpoint', {
				username,
				password,
				client_id,
				client_secret,
			} );

			if ( loginResponse.ok && loginResponse.body.success ) {
				if ( loadCookiesAfterLogin ) {
					yield reloadProxy();
				}
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

	return {
		reset,
		clearErrors,
		receiveAuthOptions,
		receiveAuthOptionsFailed,
		receiveWpLogin,
		receiveWpLoginFailed,
		receiveSendLoginEmail,
		receiveSendLoginEmailFailed,
		submitPassword,
		submitUsernameOrEmail,
	};
}

type ActionCreators = ReturnType< typeof createActions >;

export type Action =
	| ReturnType<
			| ActionCreators[ 'reset' ]
			| ActionCreators[ 'clearErrors' ]
			| ActionCreators[ 'receiveAuthOptions' ]
			| ActionCreators[ 'receiveAuthOptionsFailed' ]
			| ActionCreators[ 'receiveWpLogin' ]
			| ActionCreators[ 'receiveWpLoginFailed' ]
			| ActionCreators[ 'receiveSendLoginEmail' ]
			| ActionCreators[ 'receiveSendLoginEmailFailed' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
