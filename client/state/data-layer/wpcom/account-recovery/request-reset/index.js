/**
 * Internal dependencies
 */
import { setResetMethod } from 'state/account-recovery/reset/actions';
import { ACCOUNT_RECOVERY_RESET_REQUEST, ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS, ACCOUNT_RECOVERY_RESET_REQUEST_ERROR } from 'state/action-types';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';

export const requestReset = ( { dispatch }, action ) => {
	const {
		userData,
		method,
	} = action;

	dispatch( http( {
		method: 'POST',
		apiNamespace: 'wpcom/v2',
		path: '/account-recovery/request-reset',
		body: {
			...userData,
			method,
		},
	}, action ) );
};

export const handleError = ( { dispatch }, action, rawError ) => {
	dispatch( {
		type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
		error: rawError.message,
	} );
};

export const handleSuccess = ( { dispatch }, action ) => {
	const { method } = action;
	dispatch( setResetMethod( method ) );
	dispatch( {
		type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	} );
};

export default {
	[ ACCOUNT_RECOVERY_RESET_REQUEST ]: [ dispatchRequest(
		requestReset,
		handleSuccess,
		handleError
	) ],
};
