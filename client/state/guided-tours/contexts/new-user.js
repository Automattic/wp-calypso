/**
 * Internal dependencies
 */
import { isUserNewerThan } from './user-registration-time';

export const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;

/**
 * Returns true if the user is considered "new" (less than a week since registration)
 *
 * @param {object} state Global state tree
 * @returns {boolean} True if user is new, false otherwise
 */
export const isNewUser = ( state ) => {
	return isUserNewerThan( WEEK_IN_MILLISECONDS )( state );
};
