/**
 * Internal dependencies
 */
import {
	SUPPORT_USER_ACTIVATE,
	SUPPORT_USER_DEACTIVATE,
	SUPPORT_USER_TOKEN_FETCH,
	SUPPORT_USER_SWITCH,
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
			dispatch( supportUserSwitch() );
			supportUser.rebootWithToken( response.username, response.token );
		}

		const errorFetchingToken = ( error ) =>
			dispatch( supportUserDeactivate( error.message ) );

		return wpcom.fetchSupportUserToken( user, password )
			.then( setToken )
			.catch( errorFetchingToken );
	}
}

/**
 * To be called when support user is changing, before the page is reloaded
 * @return {Object}              Action object
 */
export function supportUserSwitch() {
	return {
		type: SUPPORT_USER_SWITCH
	}
}

export function supportUserActivate() {
	return {
		type: SUPPORT_USER_ACTIVATE
	}
}

/**
 * Dispatched when the support user is deactivated, intentionally or due to an error
 * @param  {string} errorMessage An error that caused the deactivation, if any
 * @return {Object}              Action object
 */
export function supportUserDeactivate( errorMessage = null ) {
	return {
		type: SUPPORT_USER_DEACTIVATE,
		errorMessage
	}
}

export function supportUserToggleDialog() {
	return {
		type: SUPPORT_USER_TOGGLE_DIALOG
	}
}
