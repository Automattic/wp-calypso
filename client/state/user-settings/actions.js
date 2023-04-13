import {
	USER_SETTINGS_REQUEST,
	USER_SETTINGS_REQUEST_FAILURE,
	USER_SETTINGS_REQUEST_SUCCESS,
	USER_SETTINGS_SAVE,
	USER_SETTINGS_SAVE_SUCCESS,
	USER_SETTINGS_SAVE_FAILURE,
	USER_SETTINGS_UNSAVED_CLEAR,
	USER_SETTINGS_UNSAVED_SET,
	USER_SETTINGS_UNSAVED_REMOVE,
} from 'calypso/state/action-types';

import 'calypso/state/user-settings/init';
import 'calypso/state/data-layer/wpcom/me/settings';

export { default as setUserSetting } from './thunks/set-user-setting';

/**
 * Fetch user settings from WordPress.com API and store them in UserSettings instance
 *
 * @returns {Object} Action object
 */
export const fetchUserSettings = () => ( {
	type: USER_SETTINGS_REQUEST,
} );

/**
 * Used in signalling that requesting user settings was not successful
 *
 * @param {Object} error Error object received from the API
 * @returns {Object} Action object
 */
export const fetchUserSettingsFailure = ( error ) => ( {
	type: USER_SETTINGS_REQUEST_FAILURE,
	error,
} );

/**
 * Used in signalling that requesting user settings was successful.
 *
 * @param {Object} settingValues Object containing fetched user settings
 * @returns {Object} Action object
 */
export const fetchUserSettingsSuccess = ( settingValues ) => ( {
	type: USER_SETTINGS_REQUEST_SUCCESS,
	settingValues,
} );

/**
 * Post settings to WordPress.com API at /me/settings endpoint
 *
 * @param {Object} settingsOverride - default settings object
 * @returns {Object} Action object
 */
export const saveUserSettings = ( settingsOverride ) => ( {
	type: USER_SETTINGS_SAVE,
	settingsOverride,
} );

/**
 * Returns an action object signalling the settings have been received from server.
 *
 * @param  {Object} settingValues Setting values (the subset of keys to be updated)
 * @returns {Object}               Action object
 */
export const saveUserSettingsSuccess = ( settingValues ) => ( {
	type: USER_SETTINGS_SAVE_SUCCESS,
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
