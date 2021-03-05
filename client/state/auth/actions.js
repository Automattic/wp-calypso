/**
 * Internal dependencies
 */
import { LOGIN_EMAIL_SEND } from 'calypso/state/action-types';
import { getLanguage, getLocaleSlug } from 'calypso/lib/i18n-utils';
import 'calypso/state/data-layer/wpcom/auth/send-login-email';

/**
 * Sends an email with a link that allows a user to login WordPress.com or the native apps
 *
 * @param {string} email - email to send to
 * @param {object} options -
 * @param {string} options.redirectTo - url to redirect to after login
 * @param {boolean} options.loginFormFlow - if true, dispatches actions associated with passwordless login
 * @param {boolean} options.requestLoginEmailFormFlow - if true, dispatches actions associated with email me login
 * @param {boolean} options.isMobileAppLogin - if true, will send an email that allows login to the native apps
 * @param {boolean} options.showGlobalNotices - if true, displays global notices to user about the email
 * @param {string} options.flow - name of the login flow
 * @returns {object} action object
 */
export const sendEmailLogin = (
	email,
	{
		redirectTo,
		showGlobalNotices = false,
		loginFormFlow = false,
		requestLoginEmailFormFlow = false,
		isMobileAppLogin = false,
		flow = null,
	}
) => {
	//Kind of weird usage, but this is a straight port from undocumented.js for now.
	//I can move this to the caller, if there's equivalent info in the state tree
	const locale = getLocaleSlug();
	const lang_id = getLanguage( locale ).value;

	return {
		type: LOGIN_EMAIL_SEND,
		email,
		locale,
		lang_id,
		redirect_to: redirectTo,
		isMobileAppLogin,
		showGlobalNotices,
		loginFormFlow,
		requestLoginEmailFormFlow,
		flow,
	};
};
