/**
 * Internal dependencies
 */
import 'calypso/state/help/init';

/**
 * Returns an array of course objects.
 *
 *
 * @param {object} state  Global state tree
 * @returns {Array}         Course objects
 */
export function getHelpCourses( state ) {
	return state.help.courses.items;
}
