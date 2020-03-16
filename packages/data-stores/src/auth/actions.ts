/**
 * External dependencies
 */
import { select } from '@wordpress/data-controls';
import { stringify } from 'qs';

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
	WpLoginResponse,
} from './types';
import { STORE_KEY, POLL_APP_PUSH_INTERVAL_SECONDS } from './constants';
import {
	wpcomRequest,
	fetchAndParse,
	requestAllBlogsAccess,
	reloadProxy,
	wait,
} from '../wpcom-request-controls';
import { remoteLoginUser } from './controls';
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
			let loginResponse = yield* wpLogin( 'login-endpoint', {
				remember_me: true,
				username,
				password,
			} );

			if ( ! loginResponse.success ) {
				return receiveWpLoginFailed( loginResponse );
			}

			if ( loginResponse.data.two_step_notification_sent ) {
				yield receiveWpLogin( loginResponse );

				if ( loginResponse.data.two_step_notification_sent === 'push' ) {
					loginResponse = yield* handlePush2fa( loginResponse );
				}
			}

			yield* handleSuccessfulLogin( loginResponse );

			return;
		} catch ( e ) {
			const error = {
				code: e.name,
				message: e.message,
			};

			return receiveWpLoginFailed( {
				success: false,
				data: { errors: [ error ] },
			} );
		}
	}

	function* handleSuccessfulLogin( response: WpLoginSuccessResponse ) {
		if ( loadCookiesAfterLogin ) {
			yield reloadProxy();
			// Need to rerequest access after the proxy is reloaded
			yield requestAllBlogsAccess();
		}
		yield remoteLoginUser( response.data.token_links || [] );
		yield receiveWpLogin( response );
	}

	function* handlePush2fa( response: WpLoginSuccessResponse ) {
		const { user_id, push_web_token } = response.data;
		let { two_step_nonce_push: two_step_nonce } = response.data;

		while ( ! response.data.token_links ) {
			response = yield wpLogin( 'two-step-authentication-endpoint', {
				remember_me: true,
				auth_type: 'push',
				user_id,
				two_step_nonce,
				two_step_push_token: push_web_token,
			} );

			if ( ! response.success ) {
				two_step_nonce = response.data.two_step_nonce;
				yield wait( POLL_APP_PUSH_INTERVAL_SECONDS * 1000 );
			}
		}

		return response;
	}

	type WpLoginAction = 'two-step-authentication-endpoint' | 'login-endpoint';

	function* wpLogin( action: WpLoginAction, body: object ) {
		const response = yield fetchAndParse(
			// TODO Wrap this in `localizeUrl` from lib/i18n-utils
			'https://wordpress.com/wp-login.php?action=' + encodeURIComponent( action ),
			{
				credentials: 'include',
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/x-www-form-urlencoded',
				},
				body: stringify( {
					client_id,
					client_secret,
					...body,
				} ),
			}
		);

		return response.body as WpLoginResponse;
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
