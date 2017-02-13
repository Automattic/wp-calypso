/**
 * Internal dependencies
 */
import {
	LOGIN_REQUEST,
	LOGIN_REQUEST_FAILURE,
	LOGIN_REQUEST_SUCCESS,
} from 'state/action-types';
import wp from 'lib/wp';

/**
 * Attempt to login a user.
 *
 * @param  {String}    username_or_email  Username or email of the user.
 * @param  {String}    password           Password of the user.
 * @return {Function}                     Action thunk to trigger the login process.
 */
export const loginUser = ( username_or_email, password ) => {
	return ( dispatch ) => {
		dispatch( {
			type: LOGIN_REQUEST,
			username_or_email,
			password
		} );

		return wp.undocumented().login( username_or_email, password )
			.then( ( data ) => {
				dispatch( {
					type: LOGIN_REQUEST_SUCCESS,
					username_or_email,
					password,
					data,
				} );
				location.href = '/';
			} ).catch( ( error ) => {
				dispatch( {
					type: LOGIN_REQUEST_FAILURE,
					username_or_email,
					password,
					error: error.message
				} );
			} );
	};
};
