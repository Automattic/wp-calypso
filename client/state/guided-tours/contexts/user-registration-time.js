/**
 * Internal dependencies
 */
import { getCurrentUser } from 'calypso/state/current-user/selectors';

/**
 * Returns milliseconds since registration date of the current user
 *
 * @param {object} state Global state tree
 * @returns {number|boolean} Milliseconds since registration, false if cannot be determined
 */
export const timeSinceUserRegistration = ( state ) => {
	const user = getCurrentUser( state );
	const registrationDate = user && Date.parse( user.date );
	return registrationDate ? Date.now() - registrationDate : false;
};

/**
 * Returns a selector that tests if the user is newer than a given time
 *
 * @param {number} age Number of milliseconds
 * @returns {Function} Selector function
 */
export const isUserNewerThan = ( age ) => ( state ) => {
	const userAge = timeSinceUserRegistration( state );
	return userAge !== false ? userAge <= age : false;
};

/**
 * Returns a selector that tests if the user is older than a given time
 *
 * @param {number} age Number of milliseconds
 * @returns {Function} Selector function
 */
export const isUserOlderThan = ( age ) => ( state ) => {
	const userAge = timeSinceUserRegistration( state );
	return userAge !== false ? userAge >= age : false;
};
