import { get } from 'lodash';
import {
	LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
	LOGIN_AUTH_ACCOUNT_ENCRYPTED_USERNAME_REQUEST_SUCCESS,
} from 'calypso/state/action-types';
import { recordTracksEventWithClientId as recordTracksEvent } from 'calypso/state/analytics/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { noRetry } from 'calypso/state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';

export const getAuthAccountType = ( action ) =>
	http(
		{
			path: `/users/${ encodeURIComponent( action.usernameOrEmail ) }/auth-options`,
			method: 'GET',
			apiVersion: '1.1',
			retryPolicy: noRetry(),
		},
		action
	);

export const receiveSuccess = ( action, data ) => {
	const isPasswordless = get( data, 'passwordless' );
	const isSiteLogin = get( data, 'login_by_site' );
	let type = 'regular';

	// Passwordless + login by site never mix.
	if ( isPasswordless ) {
		type = 'passwordless';
	} else if ( isSiteLogin ) {
		type = 'login_by_site';
	}

	const actions = [
		{
			type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS,
			data: {
				type,
			},
		},
		recordTracksEvent( 'calypso_login_block_login_form_get_auth_type_success' ),
	];

	if ( isSiteLogin ) {
		actions.push( {
			type: LOGIN_AUTH_ACCOUNT_ENCRYPTED_USERNAME_REQUEST_SUCCESS,
			username: get( data, 'key' ),
		} );
	} else {
		// Reset the value if the user changes their mind.
		actions.push( {
			type: LOGIN_AUTH_ACCOUNT_ENCRYPTED_USERNAME_REQUEST_SUCCESS,
			username: null,
		} );
	}

	return actions;
};

export const receiveError = ( action, { error: code, message } ) => [
	{
		type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
		error: {
			code,
			message,
			field: 'usernameOrEmail',
		},
	},
	recordTracksEvent( 'calypso_login_block_login_form_get_auth_type_failure', {
		error_code: code,
		error_message: message,
	} ),
];

const getAuthAccountTypeRequest = dispatchRequest( {
	fetch: getAuthAccountType,
	onSuccess: receiveSuccess,
	onError: receiveError,
} );

registerHandlers( 'state/data-layer/wpcom/users/auth-options/index.js', {
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING ]: [ getAuthAccountTypeRequest ],
} );
