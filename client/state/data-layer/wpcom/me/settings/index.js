/**
 * External dependencies
 */

import { isEmpty, mapValues } from 'lodash';
import { translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'calypso/lib/formatting';
import { dispatchRequest } from 'calypso/state/data-layer/wpcom-http/utils';
import getUnsavedUserSettings from 'calypso/state/selectors/get-unsaved-user-settings';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	clearUnsavedUserSettings,
	fetchUserSettingsFailure,
	fetchUserSettingsSuccess,
	saveUserSettingsSuccess,
	saveUserSettingsFailure,
} from 'calypso/state/user-settings/actions';
import { USER_SETTINGS_REQUEST, USER_SETTINGS_SAVE } from 'calypso/state/action-types';

import { registerHandlers } from 'calypso/state/data-layer/handler-registry';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';

/*
 * Decodes entities in those specific user settings properties
 * that the REST API returns already HTML-encoded
 */
const PROPERTIES_TO_DECODE = new Set( [ 'display_name', 'description', 'user_URL' ] );
export const fromApi = ( apiResponse ) =>
	mapValues( apiResponse, ( value, name ) =>
		PROPERTIES_TO_DECODE.has( name ) ? decodeEntities( value ) : value
	);

/*
 * Fetch settings from the WordPress.com API at /me/settings endpoint
 */
export const requestUserSettings = ( action ) =>
	http(
		{
			apiVersion: '1.1',
			method: 'GET',
			path: '/me/settings',
		},
		action
	);

export const requestUserSettingsFailure = ( action, error ) => fetchUserSettingsFailure( error );

export const requestUserSettingsSuccess = ( action, data ) => fetchUserSettingsSuccess( data );

/*
 * Store the fetched user settings to Redux state
 */
export const storeFetchedUserSettings = ( action, data ) => saveUserSettingsSuccess( data );

/*
 * Post settings to WordPress.com API at /me/settings endpoint
 */
export function userSettingsSave( action ) {
	return ( dispatch, getState ) => {
		const { settingsOverride } = action;
		const settings = settingsOverride || getUnsavedUserSettings( getState() );
		if ( ! isEmpty( settings ) ) {
			dispatch(
				http(
					{
						apiVersion: '1.1',
						method: 'POST',
						path: '/me/settings',
						body: settings,
					},
					action
				)
			);
		}
	};
}

export function userSettingsSaveFailure( { settingsOverride }, error ) {
	if ( settingsOverride?.password ) {
		return [
			errorNotice( translate( 'There was a problem saving your password. Please, try again.' ), {
				id: 'save-user-settings',
			} ),
			saveUserSettingsFailure( settingsOverride, error ),
		];
	}

	return [
		errorNotice( error.message || translate( 'There was a problem saving your changes.' ), {
			id: 'save-user-settings',
		} ),
		saveUserSettingsFailure( settingsOverride, error ),
	];
}

/*
 * After settings were successfully saved, update the settings stored in the Redux state,
 * clear the unsaved settings list, and re-fetch info about the user.
 */
export const userSettingsSaveSuccess = ( { settingsOverride }, data ) => ( dispatch ) => {
	dispatch( saveUserSettingsSuccess( fromApi( data ) ) );
	dispatch( clearUnsavedUserSettings( settingsOverride ? Object.keys( settingsOverride ) : null ) );

	if ( settingsOverride?.password ) {
		// Since changing a user's password invalidates the session, we reload.
		window.location = window.location.pathname + '?updated=password';
		return;
	}
	// Refetch the user data after saving user settings
	// The require() trick is used to avoid excessive mocking in unit tests.
	// TODO: Replace it with standard 'import' when the `lib/user` module is Reduxized
	const userLibModule = require( 'calypso/lib/user' );
	const userLib = userLibModule.default ? userLibModule.default : userLibModule; // TODO: delete line after removing add-module-exports.
	userLib().fetch();

	dispatch(
		successNotice( translate( 'Settings saved successfully!' ), {
			id: 'save-user-settings',
		} )
	);
};

registerHandlers( 'state/data-layer/wpcom/me/settings/index.js', {
	[ USER_SETTINGS_REQUEST ]: [
		dispatchRequest( {
			fetch: requestUserSettings,
			onSuccess: requestUserSettingsSuccess,
			onError: requestUserSettingsFailure,
			fromApi,
		} ),
	],
	[ USER_SETTINGS_SAVE ]: [
		dispatchRequest( {
			fetch: userSettingsSave,
			onSuccess: userSettingsSaveSuccess,
			onError: userSettingsSaveFailure,
			fromApi,
		} ),
	],
} );
