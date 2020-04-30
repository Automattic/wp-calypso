/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import { SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET } from 'state/action-types';

import 'state/signup/init';

export const setUsernameSuggestion = ( data ) => ( {
	type: SIGNUP_OPTIONAL_DEPENDENCY_SUGGESTED_USERNAME_SET,
	data,
} );

/**
 * Action thunk creator that gets username suggestions from the API.
 *
 * Ask the API to validate a username.
 *
 * If the API returns a suggestion, then the username is already taken.
 * If there is no error from the API, then the username is free.
 *
 * @param {string} username The username to get suggestions for.
 * @returns {Function} Redux action thunk
 */
export const fetchUsernameSuggestion = ( username ) => async ( dispatch ) => {
	// Clear out the state variable before sending the call.
	dispatch( setUsernameSuggestion( '' ) );

	const response = await wpcom.undocumented().validateNewUser( {
		givesuggestions: 1,
		username,
	} );

	if ( ! response ) {
		return null;
	}

	/**
	 * Default the suggested username to `username` because if the validation succeeds would mean
	 * that the username is free
	 */
	let resultingUsername = username;

	/**
	 * Only start checking for suggested username if the API returns an error for the validation.
	 */
	if ( ! response.success ) {
		const { messages } = response;

		/**
		 * The only case we want to update username field is when the username is already taken.
		 *
		 * This ensures that the validation is done
		 *
		 * Check for:
		 *    - username taken error -
		 *    - a valid suggested username
		 */
		if ( messages.username && messages.username.taken && messages.suggested_username ) {
			resultingUsername = messages.suggested_username.data;
		}
	}

	// Save the suggested username for later use
	dispatch( setUsernameSuggestion( resultingUsername ) );

	return resultingUsername;
};
