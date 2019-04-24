/** @format */

/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import { getCurrentUserDate } from 'state/current-user/selectors';

/**
 * Returns true if the number of days the current user has been registered for falls within the specied range of values.
 *
 * @param {Object} state Global state tree
 * @param {Object} momentInTime Current moment for determination of elapsed days since registration
 * @param {Number} from Lower bound on days
 * @param {Number} to Upper bound on days
 * @return {?Boolean} True if the number of days falls withing the specified range
 */
const isUserRegistrationDaysWithinRange = ( state, momentInTime, from, to ) => {
	const date = getCurrentUserDate( state );

	if ( ! date ) {
		return null;
	}

	momentInTime = momentInTime || moment();
	const days = momentInTime.diff( date, 'days', true );

	return days >= from && days <= to;
};

export default isUserRegistrationDaysWithinRange;
