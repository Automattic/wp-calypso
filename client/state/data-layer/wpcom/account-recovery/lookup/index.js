/** @format */
/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequestEx } from 'state/data-layer/wpcom-http/utils';
import { noRetry } from 'state/data-layer/wpcom-http/pipeline/retry-on-failure/policies';
import { ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST } from 'state/action-types';
import {
	fetchResetOptionsSuccess,
	fetchResetOptionsError,
	updatePasswordResetUserData,
} from 'state/account-recovery/reset/actions';

import { registerHandlers } from 'state/data-layer/handler-registry';

/*
 * Uses `substring()` to force string values. Anything
 * other than a string will throw, thus invalidating the parse
 */
export const fromApi = ( { primary_email, primary_sms, secondary_email, secondary_sms } ) => [
	{
		email: primary_email.substring( 0 ),
		sms: primary_sms.substring( 0 ),
		name: 'primary',
	},
	{
		email: secondary_email.substring( 0 ),
		sms: secondary_sms.substring( 0 ),
		name: 'secondary',
	},
];

export const fetch = action =>
	http(
		{
			method: 'GET',
			path: '/account-recovery/lookup',
			apiNamespace: 'wpcom/v2',
			query: action.userData,
			retryPolicy: noRetry(),
		},
		action
	);

export const onError = ( action, error ) => fetchResetOptionsError( error );

export const onSuccess = ( action, data ) => [
	fetchResetOptionsSuccess( data ),
	updatePasswordResetUserData( action.userData ),
];

registerHandlers( 'state/data-layer/wpcom/account-recovery/lookup/index.js', {
	[ ACCOUNT_RECOVERY_RESET_OPTIONS_REQUEST ]: [
		dispatchRequestEx( { fetch, onSuccess, onError, fromApi } ),
	],
} );

export default {};
