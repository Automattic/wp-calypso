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

/**
 * Creates an action for request for email verification
 *
 * @param 	{object} action The action to dispatch next
 * @returns {object} Redux action
 */
export const requestEmailVerification = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/send-verification-email',
		},
		action
	);

/**
 * Creates an action for handling email verification error
 *
 * @param 	{object} action The action to dispatch next
 * @param   {object} rawError The error object
 * @returns {object} Redux action
 */
export const handleError = ( action, rawError ) => ( {
	type: EMAIL_VERIFY_REQUEST_FAILURE,
	message: rawError.message,
} );

/**
 * Creates an action for email verification success
 *
 * @param 	{object} action The action to dispatch next
 * @returns {object} Redux action
 */
export const handleSuccess = () => ( { type: EMAIL_VERIFY_REQUEST_SUCCESS } );

export const dispatchEmailVerification = dispatchRequest( {
	fetch: requestEmailVerification,
	onSuccess: handleSuccess,
	onError: handleError,
} );

registerHandlers( 'state/data-layer/wpcom/me/send-verification-email/index.js', {
	[ EMAIL_VERIFY_REQUEST ]: [ dispatchEmailVerification ],
} );
