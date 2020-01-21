/**
 * Internal dependencies
 */
import hashPii from './hash-pii';

/**
 * Module variables
 */
let _currentUser;

/**
 * Gets current user.
 *
 * @returns {Ojbect|undefined} Current user.
 */
export function getCurrentUser() {
	return _currentUser;
}

/**
 * Sets current user.
 *
 * @returns {Ojbect|undefined} Current user.
 */
export function setCurrentUser( { ID, username, email } ) {
	const userData = { ID: parseInt( ID, 10 ), username, email };

	if ( ! userData.ID || isNaN( userData.ID ) || ! userData.username || ! userData.email ) {
		return; // Invalid user data.
	}

	userData.hashedPii = {
		ID: hashPii( userData.ID ),
		username: hashPii( userData.username.toLowerCase().replace( /\s/g, '' ) ),
		email: hashPii( userData.email.toLowerCase().replace( /\s/g, '' ) ),
	};

	_currentUser = userData;
	return _currentUser;
}
