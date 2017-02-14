/**
 * External dependencies
 */
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getCurrentUserDate } from 'state/current-user/selectors';

/**
 * Returns true if the the number of days the current user has been registered for falls within the specied range of values.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  from   Lower bound on days
 * @param  {Number}  to     Upper bound on days
 * @return {bool}           True if the number of days falls withing the specified range
 */
const isUserRegistrationDaysWithinRange = ( state, from, to ) => {
	const date = getCurrentUserDate( state );

	if ( ! date ) {
		return false;
	}

	const days = i18n.moment().diff( date, 'days', true );

	return days >= from && days <= to;
};

export default isUserRegistrationDaysWithinRange;
