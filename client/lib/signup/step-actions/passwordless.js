/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';

/**
 * Creates a user account and sends the user a verification code via email to confirm the account.
 * Returns the dependencies for the step.
 *
 * @param {Function} callback Callback function
 * @param {object}   data     POST data object
 */
export function createPasswordlessUser( callback, { email } ) {
	wpcom
		.undocumented()
		.usersEmailNew( { email }, null )
		.then( ( response ) => callback( null, response ) )
		.catch( ( err ) => callback( err ) );
}

/**
 * Verifies a passwordless user code.
 *
 * @param {Function} callback Callback function
 * @param {object}   data     POST data object
 */
export function verifyPasswordlessUser( callback, { email, code } ) {
	wpcom
		.undocumented()
		.usersEmailVerification( { email, code }, null )
		.then( ( response ) =>
			callback( null, { email, username: email, bearer_token: response.token.access_token } )
		)
		.catch( ( err ) => callback( err ) );
}
