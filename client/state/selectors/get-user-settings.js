/**
 * Returns all user settings as one object
 *
 *
 * @param {object} state Global state tree
 * @returns {?object} dictionary with the setting names and values
 */
export default function getUserSettings( state ) {
	return state.userSettings.settings;
}
