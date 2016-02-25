/**
 * Internal dependencies
 */
import {
	SUPPORT_USER_ACTIVATE,
	SUPPORT_USER_ERROR,
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_TOGGLE_DIALOG,
} from 'state/action-types';

import wpcom from 'lib/wp';
import supportUser from 'lib/user/support-user-interop';

/**
 * Requests a support user token, then dispatches the relevant actions upon response
 *
 * @param  {string} supportUser     Support username
 * @param  {string} supportPassword Support password
 * @return {thunk}                  The action thunk
 */
export function supportUserTokenFetch( user, password ) {
	return ( dispatch ) => {
		if ( !user || !password ) {
			return;
		}

		dispatch( {
			type: SUPPORT_USER_TOKEN_FETCH,
			supportUser: user
		} );

		const setToken = ( response ) => {
			supportUser.rebootWithToken( response.username, response.token );
		}

		const errorFetchingToken = ( error ) =>
			dispatch( supportUserError( error.message ) );

		return wpcom.fetchSupportUserToken( user, password )
			.then( setToken )
			.catch( errorFetchingToken );
	}
}

export function supportUserActivate() {
	return {
		type: SUPPORT_USER_ACTIVATE
	}
}

/**
 * Dispatched when an error occurs while attempting to activate support user
 * @param  {string} errorMessage
 * @return {Object}              Action object
 */
export function supportUserError( errorMessage = null ) {
	return {
		type: SUPPORT_USER_ERROR,
		errorMessage
	}
}

export function supportUserToggleDialog() {
	return {
		type: SUPPORT_USER_TOGGLE_DIALOG
	}
}
