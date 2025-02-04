import { getCurrentUser } from 'calypso/state/current-user/selectors';

export const WEEK_IN_MILLISECONDS = 7 * 1000 * 3600 * 24;

/**
 * Returns a selector that tests if the user is newer than a given time
 * @param {number} age Number of milliseconds
 * @returns {Function} Selector function
 */
export const isUserNewerThan = ( age ) => ( state ) => {
	const user = getCurrentUser( state );
	const registrationDate = user && Date.parse( user.date );
	if ( ! registrationDate ) {
		return false;
	}

	const userAge = Date.now() - registrationDate;
	return userAge <= age;
};

export const isNewUser = isUserNewerThan( WEEK_IN_MILLISECONDS );
