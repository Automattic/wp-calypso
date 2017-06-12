/**
 * Returns all unsaved user settings as one object
 *
 * @param  {Object} state Global state tree
 * @return {?Object} dictionary with the setting names and values
 */
export default function getUnsavedUserSettings( state ) {
	return state.userSettings.unsavedSettings;
}
