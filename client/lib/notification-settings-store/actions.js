/**
 * Internal dependencies
 */
import { actionTypes } from './constants';
import Dispatcher from 'dispatcher';
import wpcom from 'lib/wp';

function buildSavePayload( source, settings ) {
	switch ( source ) {
		case 'wpcom':
			return {
				wpcom: settings.toObject()
			};
		case 'other':
			return {
				other: settings.toJS()
			};
		default:
			return {
				blogs: [].concat( settings.toJS() )
			};
	}
}

export function toggleWPcomEmailSetting( setting ) {
	toggle( 'wpcom', 'email', setting );
}

export function toggle( source, stream, setting ) {
	Dispatcher.handleViewAction( {
		action: actionTypes.TOGGLE_SETTING,
		source,
		stream,
		setting
	} );
}

export function fetchSettings() {
	Dispatcher.handleViewAction( { action: actionTypes.FETCH_SETTINGS } );

	wpcom.undocumented().me().getNotificationSettings( ( error, data ) => {
		Dispatcher.handleServerAction( {
			action: error ? actionTypes.FETCH_SETTINGS_FAILED : actionTypes.FETCH_SETTINGS_COMPLETE,
			error,
			data
		} );
	} );
}

export function saveSettings( source, settings, applyToAll = false ) {
	Dispatcher.handleViewAction( { action: actionTypes.SAVE_SETTINGS } );

	wpcom.undocumented().me().updateNotificationSettings( buildSavePayload( source, settings ), applyToAll, ( error, data ) => {
		Dispatcher.handleServerAction( {
			action: error ? actionTypes.SAVE_SETTINGS_FAILED : actionTypes.SAVE_SETTINGS_COMPLETE,
			error,
			data
		} );
	} );
}
