/**
 * Internal dependencies
 */
import config from 'config';
import { AUTHENTICATE_URL } from './constants';
import { HTTPError, stringifyBody } from '../utils';
import {
	LOGIN_REQUEST_SUCCESS,
	MAGIC_LOGIN_HIDE_REQUEST_FORM,
	MAGIC_LOGIN_HIDE_REQUEST_NOTICE,
	MAGIC_LOGIN_REQUEST_AUTH_ERROR,
	MAGIC_LOGIN_REQUEST_AUTH_FETCH,
	MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
	MAGIC_LOGIN_RESET_REQUEST_FORM,
	MAGIC_LOGIN_SHOW_LINK_EXPIRED,
	MAGIC_LOGIN_SHOW_CHECK_YOUR_EMAIL_PAGE,
} from 'state/action-types';

import 'state/login/init';

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

async function postMagicLoginRequest( url, bodyObj ) {
	const response = await globalThis.fetch( url, {
		method: 'POST',
		credentials: 'include',
		headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
		body: stringifyBody( bodyObj ),
	} );

	if ( response.ok ) {
		return await response.json();
	}
	throw new HTTPError( response, await response.text() );
}

/**
 * Logs a user in from a token included in a magic link.
 *
 * @param  {string}   token      Security token
 * @param  {string}   redirectTo Url to redirect the user to upon successful login
 * @returns {Function}            A thunk that can be dispatched
 */
export const fetchMagicLoginAuthenticate = ( token, redirectTo ) => ( dispatch ) => {
	dispatch( { type: MAGIC_LOGIN_REQUEST_AUTH_FETCH } );

	postMagicLoginRequest( AUTHENTICATE_URL, {
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		token,
		redirect_to: redirectTo,
	} )
		.then( ( json ) => {
			dispatch( {
				type: LOGIN_REQUEST_SUCCESS,
				data: json.data,
			} );

			dispatch( {
				type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
			} );
		} )
		.catch( ( error ) => {
			const { status } = error;

			dispatch( {
				type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
				error: status,
			} );
		} );
};
