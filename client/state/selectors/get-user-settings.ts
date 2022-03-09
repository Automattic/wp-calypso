import type { UserSettingValue } from 'calypso/state/selectors/get-user-setting';
import type { AppState } from 'calypso/types';

import 'calypso/state/user-settings/init';

export type UserSettingsType = Record< string, UserSettingValue >;

/**
 * Returns all user settings as one object
 *
 *
 * @param {AppState} state Global state tree
 * @returns {UserSettingsType | null} dictionary with the setting names and values
 */
export default function getUserSettings( state: AppState ): UserSettingsType | null {
	return state.userSettings.settings ?? null;
}
