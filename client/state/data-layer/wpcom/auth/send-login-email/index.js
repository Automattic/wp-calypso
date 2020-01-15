/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import { MOBILE_APPS_LOGIN_EMAIL_SEND } from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { infoNotice, errorNotice, successNotice, removeNotice } from 'state/notices/actions';
import config from 'config';

export const sendLoginEmail = action => {
	const noticeAction = infoNotice( translate( 'Sending email' ), { duration: 4000 } );
	const { email, lang_id, locale } = action;
	return [
		noticeAction,
		http(
			{
				path: `/auth/send-login-email`,
				method: 'POST',
				apiVersion: '1.2',
				body: {
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					infer: true,
					scheme: 'wordpress',
					locale,
					lang_id: lang_id,
					email: email,
				},
			},
			{ ...action, infoNoticeId: noticeAction?.notice?.noticeId }
		),
	];
};

export const displaySuccessMessage = ( { infoNoticeId } ) => [
	removeNotice( infoNoticeId ),
	successNotice( translate( 'Email Sent. Check your mail app!' ), {
		duration: 4000,
	} ),
];

export const displayErrorMessage = ( { infoNoticeId } ) => [
	removeNotice( infoNoticeId ),
	errorNotice( translate( 'Sorry, we couldn’t send the email.' ), {
		duration: 4000,
	} ),
];

registerHandlers( 'state/data-layer/wpcom/auth/send-login-email/index.js', {
	[ MOBILE_APPS_LOGIN_EMAIL_SEND ]: [
		dispatchRequest( {
			fetch: sendLoginEmail,
			onSuccess: displaySuccessMessage,
			onError: displayErrorMessage,
		} ),
	],
} );
