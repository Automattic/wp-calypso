import config from '@automattic/calypso-config';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import { postLoginRequest, getErrorFromHTTPError } from 'calypso/state/login/utils';

/**
 * Logs the current user out.
 * @param  {string}   redirectTo Url to redirect the user to upon successful logout
 * @returns {Function}            A thunk that can be dispatched
 */
export const logoutUser = ( redirectTo ) => ( dispatch, getState ) => {
	const currentUser = getCurrentUser( getState() );
	const logoutNonceMatches = ( currentUser.logout_URL || '' ).match( /_wpnonce=([^&]*)/ );
	const logoutNonce = logoutNonceMatches && logoutNonceMatches[ 1 ];

	return postLoginRequest( 'logout-endpoint', {
		redirect_to: redirectTo,
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
		logout_nonce: logoutNonce,
	} )
		.then( ( response ) => response?.body?.data ?? {} )
		.catch( ( httpError ) => Promise.reject( getErrorFromHTTPError( httpError ) ) );
};
