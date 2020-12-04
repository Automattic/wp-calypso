/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Returns a selector that tests if the user has registered before given date
 *
 * @param {Date} date Date of registration
 * @returns {Function} Selector function
 */
export const hasUserRegisteredBefore = ( date ) => ( state ) => {
	const compareDate = date && Date.parse( date );
	const user = getCurrentUser( state );
	const registrationDate = user && Date.parse( user.date );
	return registrationDate < compareDate;
};
