/**
 * Returns a user object by user ID.
 *
 *
 * @param {number} userId User ID
 * @return {object}        User object
 */

export function getUser( state, userId ) {
	return state.users.items[ userId ];
}
