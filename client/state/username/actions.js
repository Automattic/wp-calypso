/** @format */

/**
 * External dependencies
 */

import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */

import {
	USERNAME_VALIDATION_FAILURE,
	USERNAME_VALIDATION_SUCCESS,
	USERNAME_CLEAR_VALIDATION,
} from 'state/action-types';
import wpcom from 'lib/wp';

export function changeUsername( username, action, callback ) {
	return dispatch =>
		wpcom
			.undocumented()
			.me()
			.changeUsername( username, action )
			.then( () => {
				callback && callback();
			} )
			.catch( error => {
				dispatch( {
					type: USERNAME_VALIDATION_FAILURE,
					error: error.error,
					message: error.message,
				} );
				callback && callback( error );
			} );
}

export function validateUsername( username ) {
	return dispatch => {
		if ( username.length < 4 ) {
			dispatch( {
				type: USERNAME_VALIDATION_FAILURE,
				error: 'invalid_input',
				message: i18n.translate( 'Usernames must be at least 4 characters.' ),
			} );
		} else if ( ! /^[a-z0-9]+$/.test( username ) ) {
			dispatch( {
				type: USERNAME_VALIDATION_FAILURE,
				error: 'invalid_input',
				message: i18n.translate(
					'Usernames can only contain lowercase letters (a-z) and numbers.'
				),
			} );
		} else {
			return wpcom
				.undocumented()
				.me()
				.validateUsername( username )
				.then( data => {
					dispatch( {
						type: USERNAME_VALIDATION_SUCCESS,
						allowedActions: data.allowed_actions,
						validatedUsername: username,
					} );
				} )
				.catch( error => {
					dispatch( {
						type: USERNAME_VALIDATION_FAILURE,
						error: error.error,
						message: error.message,
					} );
				} );
		}
	};
}

export function clearUsernameValidation() {
	return { type: USERNAME_CLEAR_VALIDATION };
}
