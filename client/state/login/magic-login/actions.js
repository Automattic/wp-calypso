/**
 * Internal dependencies
 */
import {
	MAGIC_LOGIN_HIDE_REQUEST_FORM,
	MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
	MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_SHOW_REQUEST_FORM,
} from 'state/action-types';
import wpcom from 'lib/wp';

export const showCheckYourEmailPage = () => {
	return {
		type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	};
};

export const showLinkExpiredPage = () => {
	return {
		type: MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	};
};

export const showRequestForm = () => {
	return {
		type: MAGIC_LOGIN_SHOW_REQUEST_FORM,
	};
};

export const hideRequestForm = () => {
	return {
		type: MAGIC_LOGIN_HIDE_REQUEST_FORM,
	};
};

export const hideRequestNotice = () => {
	return {
		type: MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	};
};

export const fetchRequestEmail = email => dispatch => {
	dispatch( { type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH } );

	return wpcom.undocumented().requestMagicLoginEmail( {
		email,
	} ).then( () => {
		dispatch( { type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS } );
		dispatch( {
			type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
			email
		} );
	} ).catch( error => {
		dispatch( {
			type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
			error: error.message,
		} );
	} );
};

export const setInputEmailAddress = email => {
	return {
		type: MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
		email
	};
};
