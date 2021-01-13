/**
 * External dependencies
 */

import debugFactory from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getUserSettings from 'calypso/state/selectors/get-user-settings';
import {
	USER_SETTINGS_REQUEST,
	USER_SETTINGS_SAVE,
	USER_SETTINGS_SAVE_SUCCCESS,
	USER_SETTINGS_SAVE_FAILURE,
	USER_SETTINGS_UNSAVED_CLEAR,
	USER_SETTINGS_UNSAVED_SET,
	USER_SETTINGS_UNSAVED_REMOVE,
} from 'calypso/state/action-types';

import 'calypso/state/data-layer/wpcom/me/settings';

const debug = debugFactory( 'calypso:user:settings' );

/**
 * Fetch user settings from WordPress.com API and store them in UserSettings instance
 *
 * @returns {object} Action object
 */
export const fetchUserSettings = () => ( {
	type: USER_SETTINGS_REQUEST,
} );

/**
 * Post settings to WordPress.com API at /me/settings endpoint
 *
 * @param {object} settingsOverride - default settings object
 * @param {Function} onSuccess A callback function to be called on success by the data layer handler
 * @returns {object} Action object
 */
export const saveUserSettings = ( settingsOverride, onSuccess ) => ( {
	type: USER_SETTINGS_SAVE,
	settingsOverride,
	onSuccess,
} );

/**
 * Returns an action object signalling the settings have been received from server.
 *
 * @param  {object} settingValues Setting values (the subset of keys to be updated)
 * @returns {object}               Action object
 */
export const saveUserSettingsSuccess = ( settingValues ) => ( {
	type: USER_SETTINGS_SAVE_SUCCCESS,
	settingValues,
} );

export const saveUserSettingsFailure = ( settingsOverride, error ) => ( {
	type: USER_SETTINGS_SAVE_FAILURE,
	settingsOverride,
	error,
} );

export const cancelPendingEmailChange = () => ( {
	type: USER_SETTINGS_SAVE,
	settingsOverride: { user_email_change_pending: false },
} );

export const clearUnsavedUserSettings = ( settingNames = null ) => ( {
	type: USER_SETTINGS_UNSAVED_CLEAR,
	settingNames,
} );

export const setUnsavedUserSetting = ( settingName, value ) => ( {
	type: USER_SETTINGS_UNSAVED_SET,
	settingName,
	value,
} );

export const removeUnsavedUserSetting = ( settingName ) => ( {
	type: USER_SETTINGS_UNSAVED_REMOVE,
	settingName,
} );

/**
 * Handles the storage and removal of changed setting that are pending
 * being saved to the WPCOM API.
 *
 * @param  {string} settingName - setting name
 * @param  {*} value - setting value
 * @returns {Function} Action thunk that returns updating successful response
 */
export function setUserSetting( settingName, value ) {
	return ( dispatch, getState ) => {
		const settings = getUserSettings( getState() );

		if ( get( settings, settingName ) === undefined ) {
			debug( settingName + ' does not exist in user-settings data module.' );
			return false;
		}

		/*
		 * If the two match, we don't consider the setting "changed".
		 * user_login is a special case since the logic for validating and saving a username
		 * is more complicated.
		 */
		if ( settings[ settingName ] === value && 'user_login' !== settingName ) {
			debug( 'Removing ' + settingName + ' from changed settings.' );
			dispatch( removeUnsavedUserSetting( settingName ) );
		} else {
			dispatch( setUnsavedUserSetting( settingName, value ) );
		}

		return true;
	};
}
