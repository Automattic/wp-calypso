/**
 * Returns all user settings as one object
 *
 * @param  {Object} state Global state tree
 * @return {?Object} dictionary with the setting names and values
 */
export default function getUserSettings( state ) {
	return state.userSettings.settings;
}
