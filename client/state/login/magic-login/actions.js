/**
 * External dependencies
 */
import request from 'superagent';

/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';
import { AUTHENTICATE_URL } from './constants';
import {
	MAGIC_LOGIN_HIDE_REQUEST_FORM,
	MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	MAGIC_LOGIN_REQUEST_AUTH_ERROR,
	MAGIC_LOGIN_REQUEST_AUTH_FETCH,
	MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
	MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
	MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	MAGIC_LOGIN_SHOW_REQUEST_FORM,
} from 'state/action-types';

export const showMagicLoginCheckYourEmailPage = () => {
	return {
		type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	};
};

export const showMagicLoginInterstitialPage = () => {
	return {
		type: MAGIC_LOGIN_SHOW_INTERSTITIAL_PAGE,
	};
};

export const showMagicLoginLinkExpiredPage = () => {
	return {
		type: MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	};
};

export const showMagicLoginRequestForm = () => {
	return {
		type: MAGIC_LOGIN_SHOW_REQUEST_FORM,
	};
};

export const hideMagicLoginRequestForm = () => {
	return {
		type: MAGIC_LOGIN_HIDE_REQUEST_FORM,
	};
};

export const hideMagicLoginRequestNotice = () => {
	return {
		type: MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	};
};

export const fetchMagicLoginRequestEmail = email => dispatch => {
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

const authError = error => {
	return {
		type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
		error,
	};
};

const authSuccess = () => {
	return {
		type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
	};
};

export const fetchMagicLoginAuthenticate = ( email, token, tt ) => dispatch => {
	dispatch( { type: MAGIC_LOGIN_REQUEST_AUTH_FETCH } );

	const postData = {
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		email,
		token,
		tt,
	};

	request
		.post( AUTHENTICATE_URL )
		.withCredentials()
		.send( postData )
		.set( {
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded',
		} )
		.end( ( error, response ) => {
			const { ok, statusCode } = response;

			if ( error && ! response ) {
				dispatch( authError( statusCode || 500 ) );
				return;
			}

			if ( ok && statusCode === 200 ) {
				dispatch( authSuccess() );
				return;
			}

			dispatch( authError( statusCode || 403 ) );
		} );
};

export const setMagicLoginInputEmailAddress = email => {
	return {
		type: MAGIC_LOGIN_SET_INPUT_EMAIL_ADDRESS,
		email,
	};
};
