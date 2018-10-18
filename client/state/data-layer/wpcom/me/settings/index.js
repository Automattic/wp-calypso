/** @format */

/**
 * External dependencies
 */

import { isEmpty, keys, mapValues, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import getUnsavedUserSettings from 'state/selectors/get-unsaved-user-settings';
import { http } from 'state/data-layer/wpcom-http/actions';
import { updateUserSettings, clearUnsavedUserSettings } from 'state/user-settings/actions';
import { USER_SETTINGS_REQUEST, USER_SETTINGS_SAVE } from 'state/action-types';

import { registerHandlers } from 'state/data-layer/handler-registry';

/*
 * Decodes entities in those specific user settings properties
 * that the REST API returns already HTML-encoded
 */
const PROPERTIES_TO_DECODE = new Set( [ 'display_name', 'description', 'user_URL' ] );
function fromApi( apiResponse ) {
	return mapValues( apiResponse, ( value, name ) => {
		if ( PROPERTIES_TO_DECODE.has( name ) ) {
			return decodeEntities( value );
		}

		return value;
	} );
}

/*
 * Fetch settings from the WordPress.com API at /me/settings endpoint
 */
export const requestUserSettings = ( { dispatch }, action ) =>
	dispatch(
		http(
			{
				apiVersion: '1.1',
				method: 'GET',
				path: '/me/settings',
			},
			action
		)
	);

/*
 * Store the fetched user settings to Redux state
 */
export const storeFetchedUserSettings = ( { dispatch }, action, data ) => {
	dispatch( updateUserSettings( fromApi( data ) ) );
};

/*
 * Post settings to WordPress.com API at /me/settings endpoint
 */
export function saveUserSettings( { dispatch, getState }, action ) {
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
}

/*
 * After settings were successfully saved, update the settings stored in the Redux state,
 * clear the unsaved settings list, and re-fetch info about the user.
 */
export const finishUserSettingsSave = ( { dispatch }, { settingsOverride }, data ) => {
	dispatch( updateUserSettings( fromApi( data ) ) );
	dispatch( clearUnsavedUserSettings( settingsOverride ? keys( settingsOverride ) : null ) );

	// Refetch the user data after saving user settings
	// The require() trick is used to avoid excessive mocking in unit tests.
	// TODO: Replace it with standard 'import' when the `lib/user` module is Reduxized
	const userLibModule = require( 'lib/user' );
	const userLib = userLibModule.default ? userLibModule.default : userLibModule; // TODO: delete line after removing add-module-exports.
	userLib().fetch();
};

registerHandlers( 'state/data-layer/wpcom/me/settings/index.js', {
	[ USER_SETTINGS_REQUEST ]: [
		dispatchRequest( requestUserSettings, storeFetchedUserSettings, noop ),
	],
	[ USER_SETTINGS_SAVE ]: [ dispatchRequest( saveUserSettings, finishUserSettingsSave, noop ) ],
} );
