/**
 * Internal dependencies
 */
import {
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_TOKEN_SET,
	SUPPORT_USER_RESTORE,
	SUPPORT_USER_TOGGLE_DIALOG,
} from 'state/action-types';

import wpcom from 'lib/wp';

/**
 * Requests a support user token, then dispatches the relevant actions upon response
 *
 * @param  {string} supportUser     Support username
 * @param  {string} supportPassword Support password
 * @return {thunk}                  The action thunk
 */
export function supportUserTokenFetch( supportUser, supportPassword ) {
	return ( dispatch ) => {
		if ( !supportUser || !supportPassword ) {
			return;
		}

		dispatch( {
			type: SUPPORT_USER_TOKEN_FETCH,
			supportUser
		} );

		const setToken = ( response ) =>
			dispatch( supportUserTokenSet( response.username, response.token ) );

		const errorFetchingToken = ( error ) =>
			dispatch( supportUserRestore( error.message ) );

		return wpcom.fetchSupportUserToken( supportUser, supportPassword )
			.then( setToken )
			.catch( errorFetchingToken );
	}
}

export function supportUserTokenSet( supportUser, supportToken ) {
	return {
		type: SUPPORT_USER_TOKEN_SET,
		supportUser,
		supportToken
	}
}

export function supportUserRestore( error ) {
	return {
		type: SUPPORT_USER_RESTORE,
		error
	}
}

export function supportUserToggleDialog() {
	return {
		type: SUPPORT_USER_TOGGLE_DIALOG
	}
}
