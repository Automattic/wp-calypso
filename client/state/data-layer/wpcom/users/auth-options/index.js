/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
} from 'state/action-types';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { recordTracksEventWithClientId as recordTracksEvent } from 'state/analytics/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

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

	return [
		{
			type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS,
			data: {
				type: isPasswordless ? 'passwordless' : 'regular',
			},
		},
		recordTracksEvent( 'calypso_login_block_login_form_get_auth_type_success' ),
	];
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
