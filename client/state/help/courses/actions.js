/**
 * Internal dependencies
 */
import { HELP_COURSES_RECEIVE } from 'state/action-types';

import 'state/help/init';

/**
 * Returns an action object used in signalling that a set of help courses has been
 * receivede.
 *
 * @param  {object[]} courses Array of course objects
 * @returns {object}           Action object
 */
export function receiveHelpCourses( courses ) {
	return {
		type: HELP_COURSES_RECEIVE,
		courses,
	};
}
