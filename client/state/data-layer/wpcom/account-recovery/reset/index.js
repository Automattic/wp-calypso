/** @format */
/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
} from 'state/action-types';

import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetch = action =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: '/account-recovery/reset',
			body: {
				...action.userData,
				method: action.method,
				key: action.key,
				password: action.password,
			},
		},
		action
	);

export const onError = ( action, rawError ) => ( {
	type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_ERROR,
	error: rawError.message,
} );

export const onSuccess = () => ( {
	type: ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST_SUCCESS,
} );

registerHandlers( 'state/data-layer/wpcom/account-recovery/reset/index.js', {
	[ ACCOUNT_RECOVERY_RESET_PASSWORD_REQUEST ]: [
		dispatchRequestEx( { fetch, onSuccess, onError } ),
	],
} );

export default {};
