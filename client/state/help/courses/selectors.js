/**
 * Returns true if a request is in progress to retrieve the help courses
 * or false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @return {Boolean}        Whether a request is in progress
 */
export function isRequestingHelpCourses( state ) {
	return !! state.help.courses.requesting;
}

/**
 * Returns an array of course objects.
 *
 * @param  {Object} state  Global state tree
 * @return {Array}         Course objects
 */
export function getHelpCourses( state ) {
	return state.help.courses.items;
}
