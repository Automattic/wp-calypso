/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	LOGIN_EMAIL_SEND,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
} from 'state/action-types';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { registerHandlers } from 'state/data-layer/handler-registry';
import { infoNotice, errorNotice, successNotice, removeNotice } from 'state/notices/actions';
import { recordTracksEventWithClientId } from 'state/analytics/actions';
import config from 'config';

export const sendLoginEmail = ( action ) => {
	const {
		email,
		lang_id,
		locale,
		redirect_to,
		showGlobalNotices,
		loginFormFlow,
		requestLoginEmailFormFlow,
		isMobileAppLogin,
	} = action;
	const noticeAction = showGlobalNotices
		? infoNotice( translate( 'Sending email' ), { duration: 4000 } )
		: null;
	return [
		...( showGlobalNotices ? [ noticeAction ] : [] ),
		...( loginFormFlow || requestLoginEmailFormFlow
			? [ { type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH } ]
			: [] ),
		...( requestLoginEmailFormFlow
			? [ recordTracksEventWithClientId( 'calypso_login_email_link_submit' ) ]
			: [] ),
		...( loginFormFlow
			? [ recordTracksEventWithClientId( 'calypso_login_block_login_form_send_magic_link' ) ]
			: [] ),
		http(
			{
				path: `/auth/send-login-email`,
				method: 'POST',
				apiVersion: '1.2',
				body: {
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					...( isMobileAppLogin && { infer: true } ),
					...( isMobileAppLogin && { scheme: 'wordpress' } ),
					locale,
					lang_id: lang_id,
					email: email,
					...( redirect_to && { redirect_to } ),
				},
			},
			{ ...action, infoNoticeId: noticeAction ? noticeAction.notice.noticeId : null }
		),
	];
};

export const onSuccess = ( {
	email,
	showGlobalNotices,
	infoNoticeId = null,
	loginFormFlow,
	requestLoginEmailFormFlow,
} ) => [
	...( loginFormFlow || requestLoginEmailFormFlow
		? [
				{ type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS },
				{ type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE, email },
		  ]
		: [] ),
	...( requestLoginEmailFormFlow
		? [ recordTracksEventWithClientId( 'calypso_login_email_link_success' ) ]
		: [] ),
	...( loginFormFlow
		? [ recordTracksEventWithClientId( 'calypso_login_block_login_form_send_magic_link_success' ) ]
		: [] ),
	// Default Global Notice Handling
	...( showGlobalNotices
		? [
				removeNotice( infoNoticeId ),
				successNotice( translate( 'Email Sent. Check your mail app!' ), {
					duration: 4000,
				} ),
		  ]
		: [] ),
];

export const onError = (
	{ showGlobalNotices, infoNoticeId = null, loginFormFlow, requestLoginEmailFormFlow },
	error
) => [
	...( loginFormFlow || requestLoginEmailFormFlow
		? [ { type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR, error: error.message } ]
		: [] ),
	...( requestLoginEmailFormFlow
		? [
				recordTracksEventWithClientId( 'calypso_login_email_link_failure', {
					error_code: error.error,
					error_message: error.message,
				} ),
		  ]
		: [] ),
	...( loginFormFlow
		? [
				recordTracksEventWithClientId( 'calypso_login_block_login_form_send_magic_link_failure', {
					error_code: error.error,
					error_message: error.message,
				} ),
		  ]
		: [] ),
	// Default Global Notice Handling
	...( showGlobalNotices
		? [
				removeNotice( infoNoticeId ),
				errorNotice( translate( 'Sorry, we couldn’t send the email.' ), {
					duration: 4000,
				} ),
		  ]
		: [] ),
];

registerHandlers( 'state/data-layer/wpcom/auth/send-login-email/index.js', {
	[ LOGIN_EMAIL_SEND ]: [
		dispatchRequest( {
			fetch: sendLoginEmail,
			onSuccess,
			onError,
		} ),
	],
} );
