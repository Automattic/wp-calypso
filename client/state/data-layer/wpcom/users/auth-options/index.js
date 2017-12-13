/** @format */

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

export const getAuthAccountType = ( { dispatch }, action ) => {
	const { usernameOrEmail } = action;

	dispatch(
		http(
			{
				path: `/users/${ usernameOrEmail }/auth-options`,
				method: 'GET',
				apiVersion: '1.1',
				retryPolicy: noRetry(),
			},
			action
		)
	);
};

export const receiveSuccess = ( { dispatch }, action, data ) => {
	const isPasswordless = get( data, 'passwordless' );

	dispatch( {
		type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS,
		data: {
			type: isPasswordless ? 'passwordless' : 'regular',
		},
	} );

	dispatch( recordTracksEvent( 'calypso_login_block_login_form_get_auth_type_success' ) );
};

export const receiveError = ( { dispatch }, action, error ) => {
	const { error: code, message } = error;

	dispatch( {
		type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
		error: {
			code,
			message,
			field: 'usernameOrEmail',
		},
	} );

	dispatch(
		recordTracksEvent( 'calypso_login_block_login_form_get_auth_type_failure', {
			error_code: code,
			error_message: message,
		} )
	);
};

const getAuthAccountTypeRequest = dispatchRequest(
	getAuthAccountType,
	receiveSuccess,
	receiveError
);

export default {
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUESTING ]: [ getAuthAccountTypeRequest ],
};
