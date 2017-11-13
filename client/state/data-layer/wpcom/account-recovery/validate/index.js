/** @format */

/**
 * Internal dependencies
 */

import { ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST } from 'state/action-types';
import {
	validateRequestSuccess,
	validateRequestError,
	setValidationKey,
} from 'state/account-recovery/reset/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

export const handleValidateRequest = ( { dispatch }, action ) => {
	const { userData, method, key } = action;
	dispatch(
		http(
			{
				method: 'POST',
				apiNamespace: 'wpcom/v2',
				path: '/account-recovery/validate',
				body: {
					...userData,
					method,
					key,
				},
			},
			action
		)
	);
};

export const handleValidateRequestSuccess = ( { dispatch }, { key } ) => {
	dispatch( validateRequestSuccess() );
	dispatch( setValidationKey( key ) );
};

export const handleValidateRequestFailure = ( { dispatch }, action, response ) => {
	dispatch( validateRequestError( response ) );
};

export default {
	[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST ]: [
		dispatchRequest(
			handleValidateRequest,
			handleValidateRequestSuccess,
			handleValidateRequestFailure
		),
	],
};
