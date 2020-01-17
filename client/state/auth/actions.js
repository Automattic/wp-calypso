/**
 * Internal dependencies
 */
import { LOGIN_EMAIL_SEND } from 'state/action-types';
import { getLanguage, getLocaleSlug } from 'lib/i18n-utils';
import 'state/data-layer/wpcom/auth/send-login-email';

export const sendEmailLogin = (
	email,
	{
		redirectTo,
		showGlobalNotices = false,
		loginFormFlow = false,
		requestLoginEmailFormFlow = false,
		isMobileAppLogin = false,
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
	};
};
