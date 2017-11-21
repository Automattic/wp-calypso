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
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_SUCCESS,
	LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
} from 'state/action-types';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';

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
};

export const receiveError = ( { dispatch }, action, error ) => {
	dispatch( {
		type: LOGIN_AUTH_ACCOUNT_TYPE_REQUEST_FAILURE,
		error: {
			code: error.error,
			message: error.message,
			field: 'usernameOrEmail',
		},
	} );
};

const getAuthAccountTypeRequest = dispatchRequest(
	getAuthAccountType,
	receiveSuccess,
	receiveError,
);

export default {
	[ LOGIN_AUTH_ACCOUNT_TYPE_REQUEST ]: [ getAuthAccountTypeRequest ],
};
