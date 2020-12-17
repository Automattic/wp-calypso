/**
 * External dependencies
 */
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import type {
	CurrentUser,
	CreateAccountParams,
	CreateSocialAccountParams,
	NewUserErrorResponse,
	NewUserSuccessResponse,
} from './types';
import { wpcomRequest, requestAllBlogsAccess, reloadProxy } from '../wpcom-request-controls';
import type { WpcomClientCredentials } from '../shared-types';

// Temporarily put it here
function stringifyBody( bodyObj ) {
	// Clone bodyObj, replacing null or undefined values with empty strings.
	const body = Object.fromEntries(
		Object.entries( bodyObj ?? {} ).map( ( [ key, val ] ) => [ key, val ?? '' ] )
	);
	return new globalThis.URLSearchParams( body ).toString();
}

export function createActions( clientCreds: WpcomClientCredentials ) {
	const receiveCurrentUser = ( currentUser: CurrentUser ) => ( {
		type: 'RECEIVE_CURRENT_USER' as const,
		currentUser,
	} );

	const receiveCurrentUserFailed = () => ( {
		type: 'RECEIVE_CURRENT_USER_FAILED' as const,
	} );

	const fetchNewUser = () => ( {
		type: 'FETCH_NEW_USER' as const,
	} );

	const receiveNewUser = ( response: NewUserSuccessResponse ) => ( {
		type: 'RECEIVE_NEW_USER' as const,
		response,
	} );

	const receiveNewUserFailed = ( error: NewUserErrorResponse ) => ( {
		type: 'RECEIVE_NEW_USER_FAILED' as const,
		error,
	} );

	const clearErrors = () => ( {
		type: 'CLEAR_ERRORS' as const,
	} );

	function* createAccount( params: CreateAccountParams ) {
		yield fetchNewUser();
		try {
			const newUser = yield wpcomRequest( {
				body: {
					// defaults
					is_passwordless: true,
					signup_flow_name: 'gutenboarding',
					locale: 'en',

					...clientCreds,
					...params,

					// Set to false because account validation should be a separate action
					validate: false,
				},
				path: '/users/new',
				apiVersion: '1.1',
				method: 'post',
				query: stringify( { locale: params.locale } ),
			} );

			yield reloadProxy();

			// Need to rerequest access after the proxy is reloaded
			yield requestAllBlogsAccess();

			yield receiveNewUser( newUser );

			return { ok: true } as const;
		} catch ( newUserError ) {
			yield receiveNewUserFailed( newUserError );

			return { ok: false, newUserError } as const;
		}
	}

	function* createSocialAccount( params: CreateSocialAccountParams ) {
		yield fetchNewUser();
		try {
			// This endpoint will create user if it doesn't exist
			// wpcom-json-endpoints/class.wpcom-json-api-users-social-endpoint.php
			// You can identify if this is a newly created user by checking the
			// `created: true` property in the response.
			const newUser = yield wpcomRequest( {
				body: {
					signup_flow_name: 'gutenboarding',
					locale: 'en',
					...clientCreds,
					...params,
				},
				path: '/users/social/new',
				apiVersion: '1.1',
				method: 'post',
				query: stringify( {
					http_envelope: 1,
					locale: params.locale,
				} ),
			} );

			console.log( 'newUser', newUser );

			// Even though the newUser object is received from the above API,
			// it doesn't log the user in (missing wp_set_auth_cookie()
			// in the previous request), so we need to do another request
			// to log user in.
			const loginResponse = yield window
				.fetch(
					`https://wordpress.com/wp-login.php?action=social-login-endpoint&locale=${
						params.locale || 'en'
					}`,
					{
						method: 'POST',
						credentials: 'include',
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/x-www-form-urlencoded',
						},
						body: stringifyBody( {
							...params,
							...clientCreds,
						} ),
					}
				)
				.then( ( response ) => {
					// TODO: Error handling
					return { body: response.json() };
				} );

			console.log( 'loginResponse', loginResponse );

			// Not sure if these are needed but just call them anyway
			yield reloadProxy();

			// Not sure if these are needed but just call them anyway
			// Need to rerequest access after the proxy is reloaded
			yield requestAllBlogsAccess();

			yield receiveNewUser( newUser );

			return { ok: true } as const;
		} catch ( newUserError ) {
			yield receiveNewUserFailed( newUserError );
			return { ok: false, newUserError } as const;
		}
	}

	return {
		receiveCurrentUser,
		receiveCurrentUserFailed,
		fetchNewUser,
		receiveNewUser,
		receiveNewUserFailed,
		clearErrors,
		createAccount,
		createSocialAccount,
	} as const;
}

type ActionCreators = ReturnType< typeof createActions >;

export type Action =
	| ReturnType<
			| ActionCreators[ 'receiveCurrentUser' ]
			| ActionCreators[ 'receiveCurrentUserFailed' ]
			| ActionCreators[ 'fetchNewUser' ]
			| ActionCreators[ 'receiveNewUser' ]
			| ActionCreators[ 'receiveNewUserFailed' ]
			| ActionCreators[ 'clearErrors' ]
			| ActionCreators[ 'createAccount' ]
			| ActionCreators[ 'createSocialAccount' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
