/** @format */

/**
 * Internal dependencies
 */

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	GET_APPS_SMS_REQUEST,
	GET_APPS_SMS_REQUEST_FAILURE,
	GET_APPS_SMS_REQUEST_SUCCESS,
} from 'state/action-types';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const sendRequest = action =>
	http(
		{
			apiNamespace: 'wpcom/v2',
			method: 'POST',
			path: '/me/get-apps/send-download-sms',
			body: {
				phone: action.phone,
			},
		},
		action
	);

export const handleError = ( action, rawError ) => {
	return {
		type: GET_APPS_SMS_REQUEST_FAILURE,
		message: rawError.message,
	};
};

export const handleSuccess = (/* action, response */) => {
	return { type: GET_APPS_SMS_REQUEST_SUCCESS };
};

export const requestSendSMS = dispatchRequest( {
	fetch: sendRequest,
	onSuccess: handleSuccess,
	onError: handleError,
} );

registerHandlers( 'state/data-layer/wpcom/me/send-app-sms/index.js', {
	[ GET_APPS_SMS_REQUEST ]: [ requestSendSMS ],
} );
