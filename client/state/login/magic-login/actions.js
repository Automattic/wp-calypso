/** @format */
/**
 * External dependencies
 */
import { get } from 'lodash';
import request from 'superagent';

/**
 * Internal dependencies
 */
import config from 'config';
import wpcom from 'lib/wp';
import { AUTHENTICATE_URL } from './constants';
import {
	LOGIN_REQUEST_SUCCESS,
	MAGIC_LOGIN_HIDE_REQUEST_FORM,
	MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	MAGIC_LOGIN_REQUEST_AUTH_ERROR,
	MAGIC_LOGIN_REQUEST_AUTH_FETCH,
	MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_FETCH,
	MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS,
	MAGIC_LOGIN_RESET_REQUEST_FORM,
	MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
} from 'state/action-types';

export const showMagicLoginCheckYourEmailPage = () => {
	return {
		type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
	};
};

export const showMagicLoginLinkExpiredPage = () => {
	return {
		type: MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	};
};

export const resetMagicLoginRequestForm = () => {
	return {
		type: MAGIC_LOGIN_RESET_REQUEST_FORM,
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

	return wpcom
		.undocumented()
		.requestMagicLoginEmail( {
			email,
		} )
		.then( () => {
			dispatch( { type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_SUCCESS } );
			dispatch( {
				type: MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
				email,
			} );
		} )
		.catch( error => {
			dispatch( {
				type: MAGIC_LOGIN_REQUEST_LOGIN_EMAIL_ERROR,
				error: error.message,
			} );
		} );
};

// @TODO should this move to `/state/data-layer`..?
export const fetchMagicLoginAuthenticate = ( email, token, tt ) => dispatch => {
	dispatch( { type: MAGIC_LOGIN_REQUEST_AUTH_FETCH } );

	request
		.post( AUTHENTICATE_URL )
		.withCredentials()
		.set( {
			Accept: 'application/json',
			'Content-Type': 'application/x-www-form-urlencoded',
		} )
		.send( {
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			email,
			token,
			tt,
		} )
		.then( response => {
			dispatch( {
				type: LOGIN_REQUEST_SUCCESS,
				data: get( response, 'body.data' ),
				// @TODO figure how we should treat `rememberMe`...
				rememberMe: 0,
			} );
			dispatch( {
				type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
			} );
		} )
		.catch( error => {
			const { status } = error;
			dispatch( {
				type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
				error: status,
			} );
		} );
};
