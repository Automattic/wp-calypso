import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import {
	LOGIN_EMAIL_SEND,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
} from 'calypso/state/action-types';
import { recordTracksEventWithClientId } from 'calypso/state/analytics/actions';
import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import {
	infoNotice,
	errorNotice,
	successNotice,
	removeNotice,
} from 'calypso/state/notices/actions';

export const sendLoginEmail = ( action ) => {
	const {
		email,
		lang_id,
		locale,
		redirect_to,
		blog_id,
		showGlobalNotices,
		loginFormFlow,
		requestLoginEmailFormFlow,
		isMobileAppLogin,
		flow,
		createAccount,
		source,
		tokenType,
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
		...( createAccount
			? [
					recordTracksEventWithClientId(
						'calypso_login_block_login_form_send_account_create_magic_link'
					),
			  ]
			: [] ),
		http(
			{
				path: '/auth/send-login-email',
				apiVersion: '1.3',
				method: 'POST',
				body: {
					client_id: config( 'wpcom_signup_id' ),
					client_secret: config( 'wpcom_signup_key' ),
					...( isMobileAppLogin && { infer: true } ),
					...( isMobileAppLogin && { scheme: 'wordpress' } ),
					locale,
					lang_id: lang_id,
					email: email,
					...( redirect_to && { redirect_to } ),
					...( blog_id && { blog_id } ),
					...( flow && { flow } ),
					create_account: createAccount,
					tos: getToSAcceptancePayload(),
					...( tokenType && { token_type: tokenType } ),
					source,
					calypso_env:
						window?.location?.host === 'wordpress.com' ? 'production' : config( 'env_id' ),
				},
			},
			{ ...action, infoNoticeId: noticeAction ? noticeAction.notice.noticeId : null }
		),
	];
};

export const onSuccess = (
	{ email, showGlobalNotices, infoNoticeId = null, loginFormFlow, requestLoginEmailFormFlow },
	response
) => [
	...( loginFormFlow || requestLoginEmailFormFlow
		? [
				{ type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS, response },
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
		? [
				{
					type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
					error: { code: error.error, message: error.message },
				},
		  ]
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
