/**
 * External dependencies
 */
import { isEmpty, keys, merge, noop } from 'lodash';

/**
 * Internal dependencies
 */
import { decodeEntities } from 'lib/formatting';
import { http } from 'state/data-layer/wpcom-http/actions';
import { dispatchRequest } from 'state/data-layer/wpcom-http/utils';
import { getUnsavedUserSettings } from 'state/selectors';
import { updateUserSettings, clearUnsavedUserSettings } from 'state/user-settings/actions';
import {
	USER_SETTINGS_REQUEST,
	USER_SETTINGS_SAVE,
} from 'state/action-types';

/*
 * Decodes entities in those specific user settings properties
 * that the REST API returns already HTML-encoded
 */
function fromApi( apiResponse ) {
	const decodedValues = {
		display_name: apiResponse.display_name && decodeEntities( apiResponse.display_name ),
		description: apiResponse.description && decodeEntities( apiResponse.description ),
		user_URL: apiResponse.user_URL && decodeEntities( apiResponse.user_URL )
	};

	// Some keys in the `decodedValues` can be undefined, and _.merge will ignore them,
	// while Object.assign or object spread operator wouldn't.
	return merge( {}, apiResponse, decodedValues );
}

/*
 * Fetch settings from the WordPress.com API at /me/settings endpoint
 */
export const requestUserSettings = ( { dispatch }, action, next ) => {
	dispatch( http( {
		apiVersion: '1.1',
		method: 'GET',
		path: '/me/settings',
	}, action ) );

	return next( action );
};

/*
 * Store the fetched user settings to Redux state
 */
export const storeFetchedUserSettings = ( { dispatch }, action, next, data ) => {
	dispatch( updateUserSettings( fromApi( data ) ) );
};

/*
 * Post settings to WordPress.com API at /me/settings endpoint
 */
export function saveUserSettings( { dispatch, getState }, action, next ) {
	const { settingsOverride } = action;
	const settings = settingsOverride || getUnsavedUserSettings( getState() );

	if ( ! isEmpty( settings ) ) {
		dispatch( http( {
			apiVersion: '1.1',
			method: 'POST',
			path: '/me/settings',
			body: settings,
		}, action ) );
	}

	return next( action );
}

/*
 * After settings were successfully saved, update the settings stored in the Redux state,
 * clear the unsaved settings list, and re-fetch info about the user.
 */
export const finishUserSettingsSave = ( { dispatch }, { settingsOverride }, next, data ) => {
	dispatch( updateUserSettings( fromApi( data ) ) );
	dispatch( clearUnsavedUserSettings( settingsOverride ? keys( settingsOverride ) : null ) );

	// Refetch the user data after saving user settings
	// The require() trick is used to avoid excessive mocking in unit tests.
	// TODO: Replace it with standard 'import' when the `lib/user` module is Reduxized
	require( 'lib/user' )().fetch();
};

export default {
	[ USER_SETTINGS_REQUEST ]: [ dispatchRequest( requestUserSettings, storeFetchedUserSettings, noop ) ],
	[ USER_SETTINGS_SAVE ]: [ dispatchRequest( saveUserSettings, finishUserSettingsSave, noop ) ],
};
