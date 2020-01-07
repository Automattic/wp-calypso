/**
 * Returns all unsaved user settings as one object
 *
 *
 * @param {object} state Global state tree
 * @return {?object} dictionary with the setting names and values
 */

export default function getUnsavedUserSettings( state ) {
	return state.userSettings.unsavedSettings;
}
