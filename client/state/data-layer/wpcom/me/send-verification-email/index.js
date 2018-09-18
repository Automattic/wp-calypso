/** @format */

/**
 * Internal dependencies
 */

import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import {
	EMAIL_VERIFY_REQUEST,
	EMAIL_VERIFY_REQUEST_SUCCESS,
	EMAIL_VERIFY_REQUEST_FAILURE,
} from 'state/action-types';

import { registerHandlers } from 'state/data-layer/handler-registry';

export const requestEmailVerification = function( { dispatch }, action ) {
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'POST',
				path: '/me/send-verification-email',
			},
			action
		)
	);
};

export const handleError = ( { dispatch }, action, rawError ) => {
	dispatch( {
		type: EMAIL_VERIFY_REQUEST_FAILURE,
		message: rawError.message,
	} );
};

export const handleSuccess = ( { dispatch } ) => {
	dispatch( { type: EMAIL_VERIFY_REQUEST_SUCCESS } );
};

registerHandlers( 'state/data-layer/wpcom/me/send-verification-email/index.js', {
	[ EMAIL_VERIFY_REQUEST ]: [
		dispatchRequest( requestEmailVerification, handleSuccess, handleError ),
	],
} );

export default {};
