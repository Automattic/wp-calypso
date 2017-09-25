/**
 * Internal dependencies
 */
import { HELP_COURSES_RECEIVE } from 'state/action-types';

/**
 * Returns an action object used in signalling that a set of help courses has been
 * receivede.
 *
 * @param  {Object[]} courses Array of course objects
 * @return {Object}           Action object
 */
export function receiveHelpCourses( courses ) {
	return {
		type: HELP_COURSES_RECEIVE,
		courses
	};
}
