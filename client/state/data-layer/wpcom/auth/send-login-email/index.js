import config from '@automattic/calypso-config';
import { translate } from 'i18n-calypso';
import getToSAcceptancePayload from 'calypso/lib/tos-acceptance-tracking';
import {
	LOGIN_EMAIL_SEND,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
	MAGIC_LOGIN_REQUEST_LOGIN_BY_SITE_URL_SUCCESS,
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

function isEmail( email ) {
	return email?.includes( '@' );
}

export const sendLoginEmail = ( action ) => {
	const {
		emailOrSiteUrl,
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
	} = action;

	const actions = [];

	const isEmailLogin = isEmail( emailOrSiteUrl );

	if ( showGlobalNotices ) {
		const noticeAction = infoNotice( translate( 'Sending email' ), { duration: 4000 } );
		actions.push( noticeAction );
	}

	if ( loginFormFlow || requestLoginEmailFormFlow ) {
		actions.push( { type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH } );
	}

	if ( requestLoginEmailFormFlow ) {
		actions.push( recordTracksEventWithClientId( 'calypso_login_email_link_submit' ) );
	}

	if ( isEmailLogin ) {
		actions.push( recordTracksEventWithClientId( 'calypso_login_email_link_submit' ) );
	} else {
		actions.push( recordTracksEventWithClientId( 'calypso_login_email_link_via_url_submit' ) );
	}

	if ( createAccount ) {
		actions.push(
			recordTracksEventWithClientId(
				'calypso_login_block_login_form_send_account_create_magic_link'
			)
		);
	}

	const path = isEmailLogin ? `/auth/send-login-email` : `/auth/send-login-email-by-site-url`;
	const param = isEmailLogin ? 'email' : 'site_url';

	const httpAction = http(
		{
			path,
			method: 'POST',
			apiVersion: '1.3',
			body: {
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				locale,
				lang_id,
				[ param ]: emailOrSiteUrl,
				...( isMobileAppLogin ? { infer: true, scheme: 'wordpress' } : {} ),
				...( redirect_to ? { redirect_to } : {} ),
				...( blog_id ? { blog_id } : {} ),
				...( flow ? { flow } : {} ),
				create_account: createAccount,
				tos: getToSAcceptancePayload(),
			},
		},
		{
			...action,
			infoNoticeId: actions.find( ( a ) => a.type === 'NOTICE_CREATE' )?.noticeId || null,
		}
	);

	actions.push( httpAction );

	return actions;
};

export const onSuccess = ( {
	emailOrSiteUrl,
	showGlobalNotices,
	infoNoticeId = null,
	loginFormFlow,
	requestLoginEmailFormFlow,
	meta,
} ) => {
	const actions = [];

	const isEmailLogin = isEmail( emailOrSiteUrl );
	// In case of site URL login, the censored email comes from the backend.
	const email = isEmailLogin ? emailOrSiteUrl : meta?.dataLayer?.data?.censored_email;

	if ( ! isEmailLogin ) {
		actions.push( recordTracksEventWithClientId( 'calypso_login_email_link_via_url_success' ) );
	}

	if ( isEmailLogin ) {
		if ( loginFormFlow || requestLoginEmailFormFlow ) {
			actions.push( { type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS } );
			actions.push( { type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE, email } );
		}
		if ( requestLoginEmailFormFlow ) {
			actions.push( recordTracksEventWithClientId( 'calypso_login_email_link_success' ) );
		}
	} else {
		actions.push( { type: MAGIC_LOGIN_REQUEST_LOGIN_BY_SITE_URL_SUCCESS, email } );
		actions.push( { type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE, email } );
	}

	if ( loginFormFlow ) {
		actions.push(
			recordTracksEventWithClientId( 'calypso_login_block_login_form_send_magic_link_success' )
		);
	}
	if ( showGlobalNotices ) {
		actions.push( removeNotice( infoNoticeId ) );
		actions.push(
			successNotice( translate( 'Email Sent. Check your mail app!' ), {
				duration: 4000,
			} )
		);
	}

	return actions;
};

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
