/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	CURRENT_USER_SETTINGS_RECEIVE,
	CURRENT_USER_SETTINGS_REQUEST,
	CURRENT_USER_SETTINGS_REQUEST_FAILURE,
	CURRENT_USER_SETTINGS_REQUEST_SUCCESS,
	CURRENT_USER_SETTINGS_SAVE,
	CURRENT_USER_SETTINGS_SAVE_FAILURE,
	CURRENT_USER_SETTINGS_SAVE_SUCCESS
} from 'state/action-types';

export function receiveCurrentUserSettings( settings ) {
	return {
		type: CURRENT_USER_SETTINGS_RECEIVE,
		settings
	};
}

export function requestCurrentUserSettings() {
	return ( dispatch ) => {
		dispatch( { type: CURRENT_USER_SETTINGS_REQUEST } );

		return wpcom.me().settings().get().then( ( settings ) => {
			dispatch( receiveCurrentUserSettings( settings ) );
			dispatch( { type: CURRENT_USER_SETTINGS_REQUEST_SUCCESS } );
		} ).catch( ( error ) => {
			dispatch( { type: CURRENT_USER_SETTINGS_REQUEST_FAILURE, error } );
		} );
	};
}

export function saveUserSettings( settings ) {
	return ( dispatch ) => {
		dispatch( { type: CURRENT_USER_SETTINGS_SAVE } );

		return wpcom.me().settings().update( settings ).then( ( updated ) => {
			dispatch( receiveCurrentUserSettings( updated ) );
			dispatch( { type: CURRENT_USER_SETTINGS_SAVE_SUCCESS } );
		} ).catch( ( error ) => {
			dispatch( { type: CURRENT_USER_SETTINGS_SAVE_FAILURE, error } );
		} );
	};
}
