/**
 * External dependencies
 */
import { stringify } from 'qs';

/**
 * Internal dependencies
 */
import {
	CurrentUser,
	CreateAccountParams,
	NewUserErrorResponse,
	NewUserSuccessResponse,
	ValidateUserParams,
	ValidateUserSuccessResponse,
	ValidateUserErrorResponse,
} from './types';
import { wpcomRequest, requestAllBlogsAccess, reloadProxy } from '../wpcom-request-controls';
import { WpcomClientCredentials } from '../shared-types';

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

	const receiveValidatedUsername = (
		username: string,
		response: ValidateUserSuccessResponse
	) => ( {
		type: 'RECEIVE_VALIDATED_USERNAME' as const,
		username,
		response,
	} );

	const receiveValidatedUsernameFailed = (
		username: string,
		error: ValidateUserErrorResponse
	) => ( {
		type: 'RECEIVE_VALIDATED_USERNAME_FAILED' as const,
		username,
		error,
	} );

	const clearErrors = () => ( {
		type: 'CLEAR_ERRORS' as const,
	} );

	const clearValidatedUsername = () => ( {
		type: 'CLEAR_VALIDATED_USERNAME' as const,
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
					validate: true,
				},
				path: '/users/new',
				apiVersion: '1.1',
				method: 'post',
				query: stringify( { locale: params.locale } ),
			} );

			yield reloadProxy();

			// Need to rerequest access after the proxy is reloaded
			yield requestAllBlogsAccess();

			return receiveNewUser( newUser );
		} catch ( err ) {
			yield receiveNewUserFailed( err );

			return false;
		}
	}

	function* validateUsername( params: ValidateUserParams ) {
		const { username, locale } = params;
		try {
			const response = yield wpcomRequest( {
				body: {
					username,
					givesuggestions: 1,
				},
				path: '/signups/validation/user/',
				apiVersion: '1.1',
				method: 'post',
				query: stringify( { locale } ),
			} );

			return receiveValidatedUsername( username, response );
		} catch ( err ) {
			return receiveValidatedUsernameFailed( username, err );
		}
	}

	return {
		receiveCurrentUser,
		receiveCurrentUserFailed,
		fetchNewUser,
		receiveNewUser,
		receiveNewUserFailed,
		receiveValidatedUsername,
		receiveValidatedUsernameFailed,
		clearErrors,
		clearValidatedUsername,
		createAccount,
		validateUsername,
	};
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
			| ActionCreators[ 'clearValidatedUsername' ]
			| ActionCreators[ 'validateUsername' ]
			| ActionCreators[ 'receiveValidatedUsername' ]
			| ActionCreators[ 'receiveValidatedUsernameFailed' ]
	  >
	// Type added so we can dispatch actions in tests, but has no runtime cost
	| { type: 'TEST_ACTION' };
