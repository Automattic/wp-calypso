import type { AppState } from 'calypso/types';

import 'calypso/state/user-settings/init';

export type UserSettingValue = boolean | number | string;

/**
 * Given a settingName, returns that setting if it exists or null
 *
 * @param  {AppState} state Global state tree
 * @param  {string} settingName - setting name
 * @returns {boolean | number | string | null} setting value
 */
export default function getUserSetting(
	state: AppState,
	settingName: string
): UserSettingValue | null {
	const { settings, unsavedSettings } = state.userSettings;
	let setting = null;

	// If we haven't fetched settings, or if the setting doesn't exist return null
	const originalSetting = settings?.[ settingName ];
	if ( originalSetting !== undefined ) {
		setting = unsavedSettings?.[ settingName ] ?? originalSetting;
	}

	return setting;
}
