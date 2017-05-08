/**
 * Returns a boolean signifying whether there are settings or not
 *
 * @param  {Object} state Global state tree
 * @return {Boolean} true is the user has settings object
 */
export default function hasUserSettings( state ) {
	return !! state.userSettings.settings;
}
