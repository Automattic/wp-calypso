/**
 * Returns an array of course objects.
 * 
 *
 * @format
 * @param {Object} state  Global state tree
 * @return {Array}         Course objects
 */

export function getHelpCourses( state ) {
	return state.help.courses.items;
}
