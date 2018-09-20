/** @format */
/**
 * Internal dependencies
 */
import {
	ACCOUNT_RECOVERY_RESET_REQUEST,
	ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
} from 'state/action-types';
import { setResetMethod } from 'state/account-recovery/reset/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { http } from 'state/data-layer/wpcom-http/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const fetch = action =>
	http(
		{
			method: 'POST',
			apiNamespace: 'wpcom/v2',
			path: '/account-recovery/request-reset',
			body: {
				...action.userData,
				method: action.method,
			},
		},
		action
	);

export const onError = ( action, rawError ) => ( {
	type: ACCOUNT_RECOVERY_RESET_REQUEST_ERROR,
	error: rawError.message,
} );

export const onSuccess = action => [
	setResetMethod( action.method ),
	{
		type: ACCOUNT_RECOVERY_RESET_REQUEST_SUCCESS,
	},
];

registerHandlers( 'state/data-layer/wpcom/account-recovery/request-reset/index.js', {
	[ ACCOUNT_RECOVERY_RESET_REQUEST ]: [
		dispatchRequestEx( {
			fetch,
			onSuccess,
			onError,
		} ),
	],
} );

export default {};
