/**
 * External dependencies
 */

import debugFactory from 'debug';
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import getUserSettings from 'state/selectors/get-user-settings';
import {
	USER_SETTINGS_REQUEST,
	USER_SETTINGS_SAVE,
	USER_SETTINGS_UPDATE,
	USER_SETTINGS_UNSAVED_CLEAR,
	USER_SETTINGS_UNSAVED_SET,
	USER_SETTINGS_UNSAVED_REMOVE,
} from 'state/action-types';

import 'state/data-layer/wpcom/me/settings';

const debug = debugFactory( 'calypso:user:settings' );

/**
 * Documentation for onError callback that can be supplied to some of the actions below.
 *
 * @callback userSettingsOnErrorCallback
 * @param {object} error
 */

/**
 * Fetch user settings from WordPress.com API and store them in UserSettings instance
 *
 * @param {userSettingsOnErrorCallback} onError - callback to invoke if an error occurs
 * @returns {object} Action object
 */
export const fetchUserSettings = ( onError ) => ( {
	type: USER_SETTINGS_REQUEST,
	onError,
} );

/**
 * Post settings to WordPress.com API at /me/settings endpoint
 *
 * @param {object} settingsOverride - default settings object
 * @param {userSettingsOnErrorCallback} onError - callback to invoke if an error occurs
 * @returns {object} Action object
 */
export const saveUserSettings = ( settingsOverride, onError ) => ( {
	type: USER_SETTINGS_SAVE,
	onError,
	settingsOverride: settingsOverride || false,
} );

/**
 * Returns an action object signalling the settings have been received from server.
 *
 * @param  {object} settingValues Setting values (the subset of keys to be updated)
 * @returns {object}               Action object
 */
export const updateUserSettings = ( settingValues ) => ( {
	type: USER_SETTINGS_UPDATE,
	settingValues,
} );

/**
 * Returns an action object signalling a pending email change should be cancelled.
 *
 * @param {userSettingsOnErrorCallback} onError - callback to invoke if an error occurs.
 * @returns {object} Action object
 */
export const cancelPendingEmailChange = ( onError ) => ( {
	type: USER_SETTINGS_SAVE,
	settingsOverride: { user_email_change_pending: false },
	onError,
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
