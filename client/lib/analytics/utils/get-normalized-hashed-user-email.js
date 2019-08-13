/**
 * Internal dependencies
 */
import hashPii from './hash-pii';

/**
 * Returns the current user email after normalizing it (lowercase without spaces) or `false` if no email or user is available.
 *
 * @param {Object} user The current user
 * @return {false|string} The current user email after normalization
 */
export function getNormalizedHashedUserEmail( user ) {
	const currentUser = user.get();
	if ( currentUser && currentUser.email ) {
		return hashPii( currentUser.email.toLowerCase().replace( /\s/g, '' ) );
	}

	return false;
}
