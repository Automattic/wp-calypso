import config from '@automattic/calypso-config';
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
} from 'calypso/state/action-types';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { HTTPError, stringifyBody } from '../utils';
import { AUTHENTICATE_URL } from './constants';

import 'calypso/state/login/init';

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
 * Logs a user in from a token included in a magic link or magic code.
 * @param	{string}	token	Security token
 * @param	{string}	redirectTo	Url to redirect the user to upon successful login
 * @param	{string | null}	flow	The client's login flow
 * @param	{boolean}	isMagicCode	Whether this is a magic code (true) or magic link (false)
 * @returns	{Function}	A thunk that can be dispatched
 */
export const fetchMagicLoginAuthenticate =
	( token, redirectTo, flow = null, isMagicCode = false ) =>
	( dispatch ) => {
		dispatch( { type: MAGIC_LOGIN_REQUEST_AUTH_FETCH } );

		// Track authentication attempt
		dispatch(
			recordTracksEvent( 'calypso_login_magic_authenticate_attempt', {
				flow,
				token_type: isMagicCode ? 'code' : 'link',
			} )
		);

		postMagicLoginRequest( AUTHENTICATE_URL, {
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
			token,
			redirect_to: redirectTo,
			flow,
		} )
			.then( ( json ) => {
				// Track successful authentication
				dispatch(
					recordTracksEvent( 'calypso_login_magic_authenticate_success', {
						flow,
						token_type: isMagicCode ? 'code' : 'link',
					} )
				);

				dispatch( {
					type: LOGIN_REQUEST_SUCCESS,
					data: json.data,
				} );

				dispatch( {
					type: MAGIC_LOGIN_REQUEST_AUTH_SUCCESS,
					data: json.data,
				} );
			} )
			.catch( ( error ) => {
				const { status, response } = error;

				// Track failed authentication
				dispatch(
					recordTracksEvent( 'calypso_login_magic_authenticate_failure', {
						flow,
						token_type: isMagicCode ? 'code' : 'link',
						error_code: status,
						error_message: response?.body?.data?.errors?.[ 0 ]?.code || 'unknown',
					} )
				);

				dispatch( {
					type: MAGIC_LOGIN_REQUEST_AUTH_ERROR,
					error: {
						code: status,
						type: response?.body?.data?.errors?.[ 0 ]?.code || null,
					},
				} );
			} );
	};
