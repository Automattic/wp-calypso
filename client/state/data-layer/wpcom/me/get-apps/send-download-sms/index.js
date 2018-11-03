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

export const requestSendSMS = function( { dispatch }, action ) {
	dispatch(
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
		)
	);
};

export const handleError = ( { dispatch }, action, rawError ) => {
	dispatch( {
		type: GET_APPS_SMS_REQUEST_FAILURE,
		message: rawError.message,
	} );
};

export const handleSuccess = ( { dispatch } ) => {
	dispatch( { type: GET_APPS_SMS_REQUEST_SUCCESS } );
};

registerHandlers( 'state/data-layer/wpcom/me/send-app-sms/index.js', {
	[ GET_APPS_SMS_REQUEST ]: [ dispatchRequest( requestSendSMS, handleSuccess, handleError ) ],
} );
