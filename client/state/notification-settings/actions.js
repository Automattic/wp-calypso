import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	NOTIFICATION_SETTINGS_FETCH,
	NOTIFICATION_SETTINGS_FETCH_COMPLETE,
	NOTIFICATION_SETTINGS_FETCH_FAILED,
	NOTIFICATION_SETTINGS_SAVE,
	NOTIFICATION_SETTINGS_SAVE_COMPLETE,
	NOTIFICATION_SETTINGS_SAVE_FAILED,
	NOTIFICATION_SETTINGS_TOGGLE_SETTING,
} from 'calypso/state/action-types';
import { successNotice, errorNotice } from 'calypso/state/notices/actions';

import 'calypso/state/notification-settings/init';

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

	wpcom.req
		.get( '/me/notifications/settings/' )
		.then( ( data ) =>
			dispatch( {
				type: NOTIFICATION_SETTINGS_FETCH_COMPLETE,
				data,
			} )
		)
		.catch( () =>
			dispatch( {
				type: NOTIFICATION_SETTINGS_FETCH_FAILED,
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

const showSaveSuccessNotice = () =>
	successNotice( translate( 'Settings saved successfully!' ), {
		id: 'notif-settings-save',
		duration: 4000,
	} );

const showSaveErrorNotice = () =>
	errorNotice( translate( 'There was a problem saving your changes. Please, try again.' ), {
		id: 'notif-settings-save',
	} );

export const saveSettings =
	( source, settings, applyToAll = false ) =>
	( dispatch ) => {
		dispatch( { type: NOTIFICATION_SETTINGS_SAVE } );

		const query = applyToAll ? { applyToAll: true } : {};

		wpcom.req
			.post( '/me/notifications/settings/', query, buildSavePayload( source, settings ) )
			.then( ( data ) => {
				dispatch( showSaveSuccessNotice() );
				dispatch( {
					type: NOTIFICATION_SETTINGS_SAVE_COMPLETE,
					data,
				} );
			} )
			.catch( () => {
				dispatch( showSaveErrorNotice() );
				dispatch( {
					type: NOTIFICATION_SETTINGS_SAVE_FAILED,
				} );
			} );
	};
