/**
 * Internal dependencies
 */
import hashPii from './hash-pii';

/**
 * Module variables
 */
let _currentUser: CurrentUser;

export interface SetCurrentUserParams {
	ID: string;
	username: string;
	email: string;
}

export interface CurrentUserHashedPii {
	ID: string;
	username: string;
	email: string;
}

export interface CurrentUser {
	ID: number;
	username: string;
	email: string;
	hashedPii: CurrentUserHashedPii;
}

/**
 * Gets current user.
 *
 * @returns Current user.
 */
export function getCurrentUser(): CurrentUser {
	return _currentUser;
}

/**
 * Sets current user, (stored in javascript memory).
 *
 * @param currentUser the user data for the current user
 * @returns Current user.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function setCurrentUser( currentUser: SetCurrentUserParams ): CurrentUser | undefined {
	if (
		! currentUser.ID ||
		isNaN( parseInt( currentUser.ID, 10 ) ) ||
		! currentUser.username ||
		! currentUser.email
	) {
		return; // Invalid user data.
	}
	_currentUser = {
		ID: parseInt( currentUser.ID, 10 ),
		username: currentUser.username,
		email: currentUser.email,
		hashedPii: {
			ID: hashPii( currentUser.ID ),
			username: hashPii( currentUser.username.toLowerCase().replace( /\s/g, '' ) ),
			email: hashPii( currentUser.email.toLowerCase().replace( /\s/g, '' ) ),
		},
	};
	return _currentUser;
}
