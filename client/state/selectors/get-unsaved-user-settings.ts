import type { UserSettingsType } from 'calypso/state/selectors/get-user-settings';
import type { AppState } from 'calypso/types';

import 'calypso/state/user-settings/init';

/**
 * Returns all unsaved user settings as one object
 *
 *
 * @param {AppState} state Global state tree
 * @returns {UserSettingsType | null} dictionary with the setting names and values
 */

export default function getUnsavedUserSettings( state: AppState ): UserSettingsType | null {
	return state.userSettings.unsavedSettings ?? null;
}
