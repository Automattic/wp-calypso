import { getLanguage } from '@automattic/i18n-utils';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import { LOGIN_EMAIL_SEND } from 'calypso/state/action-types';
import 'calypso/state/data-layer/wpcom/auth/send-login-email';

/**
 * Sends an email with a link that allows a user to login WordPress.com or the native apps
 * @param {string} email - email to send to
 * @param {Object} options object:
 * @param {string} options.redirectTo - url to redirect to after login
 * @param {string} options.blogId - id of blog when in process of subscribing
 * @param {boolean} options.loginFormFlow - if true, dispatches actions associated with passwordless login
 * @param {boolean} options.requestLoginEmailFormFlow - if true, dispatches actions associated with email me login
 * @param {boolean} options.isMobileAppLogin - if true, will send an email that allows login to the native apps
 * @param {boolean} options.showGlobalNotices - if true, displays global notices to user about the email
 * @param {string} options.flow - name of the login flow
 * @param {boolean} options.createAccount - if true, instructs the API to create a WPCOM account associated with email
 * @param {'link'|'code'} options.tokenType - type of token to send in the email
 * @param {boolean} options.source - source of the login request (optional)
 * @returns {Object} action object
 */
export const sendEmailLogin = (
	email,
	{
		redirectTo,
		blogId,
		showGlobalNotices = false,
		loginFormFlow = false,
		requestLoginEmailFormFlow = false,
		isMobileAppLogin = false,
		flow = null,
		createAccount = false,
		tokenType = 'link',
		source = '',
	}
) => {
	const locale = getLocaleSlug();
	const lang_id = getLanguage( locale ).value;

	return {
		type: LOGIN_EMAIL_SEND,
		email,
		locale,
		lang_id,
		redirect_to: redirectTo,
		blog_id: blogId,
		isMobileAppLogin,
		showGlobalNotices,
		loginFormFlow,
		requestLoginEmailFormFlow,
		flow,
		createAccount,
		tokenType,
		source,
	};
};
