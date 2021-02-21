/**
 * Internal dependencies
 */

import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	EMAIL_VERIFY_REQUEST,
	EMAIL_VERIFY_REQUEST_SUCCESS,
	EMAIL_VERIFY_REQUEST_FAILURE,
} from 'calypso/state/action-types';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { translate } from 'i18n-calypso';
import {
	infoNotice,
	errorNotice,
	successNotice,
	removeNotice,
} from 'calypso/state/notices/actions';

const infoNoticeId = 'email-verification-info-notice';

/**
 * Creates an action for request for email verification
 *
 * @param 	{object} action The action to dispatch next
 * @returns {object} Redux action
 */
export const requestEmailVerification = ( action ) => [
	...( action?.showGlobalNotices
		? [ infoNotice( translate( 'Sending email…' ), { id: infoNoticeId, duration: 4000 } ) ]
		: [] ),
	http(
		{
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/send-verification-email',
		},
		action
	),
];

/**
 * Creates an action for handling email verification error
 *
 * @param 	{object} action The action to dispatch next
 * @param   {object} rawError The error object
 * @returns {object} Redux action
 */
export const handleError = ( action, rawError ) => [
	{
		type: EMAIL_VERIFY_REQUEST_FAILURE,
		message: rawError.message,
	},
	...( action?.showGlobalNotices
		? [
				removeNotice( infoNoticeId ),
				errorNotice( translate( 'Sorry, we couldn’t send the email.' ), {
					id: 'email-verification-error-notice',
					duration: 4000,
				} ),
		  ]
		: [] ),
];

/**
 * Creates an action for email verification success
 *
 * @param 	{object} action The action to dispatch next
 * @returns {object} Redux action
 */
export const handleSuccess = ( action ) => [
	{ type: EMAIL_VERIFY_REQUEST_SUCCESS },
	...( action?.showGlobalNotices
		? [
				removeNotice( infoNoticeId ),
				successNotice( translate( 'Email sent' ), {
					id: 'email-verification-success-notice',
					duration: 4000,
				} ),
		  ]
		: [] ),
];

export const dispatchEmailVerification = dispatchRequest( {
	fetch: requestEmailVerification,
	onSuccess: handleSuccess,
	onError: handleError,
} );

registerHandlers( 'state/data-layer/wpcom/me/send-verification-email/index.js', {
	[ EMAIL_VERIFY_REQUEST ]: [ dispatchEmailVerification ],
} );
