/** @format */
/**
 * Returns an array of course objects.
 *
 * @param  {Object} state  Global state tree
 * @return {Array}         Course objects
 */
export function getHelpCourses( state ) {
	return state.help.courses.items;
}
