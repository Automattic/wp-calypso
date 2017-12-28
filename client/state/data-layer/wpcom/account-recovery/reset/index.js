/** @format */

/**
 * Internal dependencies
 */

import {
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
} from 'client/state/action-types';

import { dispatchRequest } from 'client/state/data-layer/wpcom-http/utils';
import { http } from 'client/state/data-layer/wpcom-http/actions';

export const resetPassword = ( { dispatch }, action ) => {
	const {
		userData, // userData can be either { user } or { firstname, lastname, url }
		method,
		key,
		password,
	} = action;

	dispatch(
		http(
			{
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				path: '/account-recovery/reset',
				body: {
					...userData,
					method,
					key,
					password,
				},
			},
			action
		)
	);
};

export const handleError = ( { dispatch }, action, rawError ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
		error: rawError.message,
	} );
};

export const handleSuccess = ( { dispatch } ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
	} );
};

export default {
	[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST ]: [
		dispatchRequest( resetPassword, handleSuccess, handleError ),
	],
};
