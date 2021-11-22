import config from '@automattic/calypso-config';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import wpcom from 'calypso/lib/wp';

/**
 * Creates a user account and sends the user a verification code via email to confirm the account.
 * Returns the dependencies for the step.
 *
 * @param {Function} callback Callback function
 * @param {object}   data     POST data object
 * @param {string}   data.email
 */
export function createPasswordlessUser( callback, { email } ) {
	wpcom.req.post(
		'/users/email/new',
		{
			email,
			locale: getLocaleSlug(),
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		},
		callback
	);
}

/**
 * Verifies a passwordless user code.
 *
 * @param {Function} callback Callback function
 * @param {object}   data     POST data object
 * @param {string}   data.email
 * @param {string}   data.code
 */
export function verifyPasswordlessUser( callback, { email, code } ) {
	wpcom.req
		.post( '/users/email/verification', {
			email,
			code,
			client_id: config( 'wpcom_signup_id' ),
			client_secret: config( 'wpcom_signup_key' ),
		} )
		.then( ( response ) =>
			callback( null, { email, username: email, bearer_token: response.token.access_token } )
		)
		.catch( ( err ) => callback( err ) );
}
