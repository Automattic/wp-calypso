/**
 * Internal dependencies
 */
import { getCurrentUserDate } from 'calypso/state/current-user/selectors';

const DAY_IN_MS = 1000 * 60 * 60 * 24;

/**
 * Returns true if the number of days the current user has been registered for falls within the specied range of values.
 *
 * @param {object} state Global state tree
 * @param {Date} refDate Date for determination of elapsed days since registration
 * @param {number} from Lower bound on days
 * @param {number} to Upper bound on days
 * @returns {?boolean} True if the number of days falls withing the specified range
 */
export default function isUserRegistrationDaysWithinRange( state, refDate, from, to ) {
	const date = getCurrentUserDate( state );

	if ( ! date ) {
		return null;
	}

	refDate = refDate || Date.now();
	const days = ( refDate - new Date( date ) ) / DAY_IN_MS;

	return days >= from && days <= to;
}
