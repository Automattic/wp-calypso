/**
 * Internal dependencies
 */
import {
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
} from 'state/action-types';

/**
 * Attempt to login a user.
 *
 * @param  {String}    usernameOrEmail    Username or email of the user.
 * @param  {String}    password           Password of the user.
 * @return {Function}                     Action thunk to trigger the login process.
 */
export const loginUser = ( usernameOrEmail, password ) => {
	return ( dispatch ) => {
		dispatch( {
			type: LOGIN_REQUEST,
			usernameOrEmail
		} );

		password;
		// TODO: call the new login endpoint here
		return Promise.resolve()
			.then( ( data ) => {
				dispatch( {
					type: LOGIN_REQUEST_SUCCESS,
					usernameOrEmail,
					data,
				} );
			} ).catch( ( error ) => {
				dispatch( {
					type: LOGIN_REQUEST_FAILURE,
					usernameOrEmail,
					error: error.message
				} );
			} );
	};
};
