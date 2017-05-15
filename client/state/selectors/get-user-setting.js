/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Given a settingName, returns that setting if it exists or null
 *
 * @param  {Object} state Global state tree
 * @param  {String} settingName - setting name
 * @return {*} setting name value
 */
export default function getUserSetting( state, settingName ) {
	const { settings, unsavedSettings } = state.userSettings;
	let setting = null;

	// If we haven't fetched settings, or if the setting doesn't exist return null
	const originalSetting = get( settings, settingName );
	if ( originalSetting !== undefined ) {
		setting = get( unsavedSettings, settingName, originalSetting );
	}

	return setting;
}
