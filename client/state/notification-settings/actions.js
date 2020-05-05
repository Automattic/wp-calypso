/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	NOTIFICATION_SETTINGS_FETCH,
	NOTIFICATION_SETTINGS_FETCH_COMPLETE,
	NOTIFICATION_SETTINGS_FETCH_FAILED,
	NOTIFICATION_SETTINGS_REQUEST,
	NOTIFICATION_SETTINGS_SAVE,
	NOTIFICATION_SETTINGS_SAVE_COMPLETE,
	NOTIFICATION_SETTINGS_SAVE_FAILED,
	NOTIFICATION_SETTINGS_UPDATE,
	NOTIFICATION_SETTINGS_TOGGLE_SETTING,
} from 'state/action-types';
import { successNotice, errorNotice } from 'state/notices/actions';
import 'state/data-layer/wpcom/me/notification/settings';

/**
 * Returns an action object to signal the request of the current user notification settings.
 *
 * @returns {object} action object
 */
export const requestNotificationSettings = () => ( { type: NOTIFICATION_SETTINGS_REQUEST } );

/**
 * Returns an action object to signal the arrival of the requested notification settings.
 *
 * @param  {object} settings User Notification Settings
 * @returns {object}          action object
 */
export const updateNotificationSettings = ( settings ) => ( {
	type: NOTIFICATION_SETTINGS_UPDATE,
	settings,
} );

export const toggle = ( source, stream, setting ) => ( dispatch ) => {
	dispatch( {
		type: NOTIFICATION_SETTINGS_TOGGLE_SETTING,
		source,
		stream,
		setting,
	} );
};

export const toggleWPcomEmailSetting = ( setting ) => toggle( 'wpcom', 'email', setting );

export const fetchSettings = () => ( dispatch ) => {
	dispatch( { type: NOTIFICATION_SETTINGS_FETCH } );

	wpcom
		.undocumented()
		.me()
		.getNotificationSettings()
		.then( ( data ) =>
			dispatch( {
				type: NOTIFICATION_SETTINGS_FETCH_COMPLETE,
				data,
			} )
		)
		.catch( ( error ) =>
			dispatch( {
				type: NOTIFICATION_SETTINGS_FETCH_FAILED,
				error,
			} )
		);
};

function buildSavePayload( source, settings ) {
	switch ( source ) {
		case 'wpcom':
			return {
				wpcom: settings,
			};
		case 'other':
			return {
				other: settings,
			};
		default:
			return {
				blogs: [].concat( settings ),
			};
	}
}

export const showSaveSuccessNotice = () =>
	successNotice( translate( 'Settings saved successfully!' ), {
		id: 'notif-settings-save',
		duration: 4000,
	} );

export const showSaveErrorNotice = () =>
	errorNotice( translate( 'There was a problem saving your changes. Please, try again.' ), {
		id: 'notif-settings-save',
	} );

export const saveSettings = ( source, settings, applyToAll = false ) => ( dispatch ) => {
	dispatch( { type: NOTIFICATION_SETTINGS_SAVE } );

	wpcom
		.undocumented()
		.me()
		.updateNotificationSettings(
			buildSavePayload( source, settings ),
			applyToAll,
			( error, data ) => {
				if ( error ) {
					dispatch( showSaveErrorNotice() );
					dispatch( {
						type: NOTIFICATION_SETTINGS_SAVE_FAILED,
						error,
						data,
					} );
				} else {
					dispatch( showSaveSuccessNotice() );
					dispatch( {
						type: NOTIFICATION_SETTINGS_SAVE_COMPLETE,
						error,
						data,
					} );
				}
			}
		);
};
