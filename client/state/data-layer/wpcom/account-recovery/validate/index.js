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
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

export const fetch = action =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: '/account-recovery/validate',
			body: {
				...action.userData,
				method: action.method,
				key: action.key,
			},
		},
		action
	);

export const onSuccess = ( { key } ) => [ validateRequestSuccess(), setValidationKey( key ) ];

export const onError = ( action, response ) => validateRequestError( response );

export default {
	[ ACCOUNT_RECOVERY_RESET_VALIDATE_REQUEST ]: [
		dispatchRequestEx( { fetch, onSuccess, onError } ),
	],
};
