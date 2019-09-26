/**
 * Returns a user object by user ID.
 *
 * @param  {object} state  Global state tree
 * @param  {number} userId User ID
 * @return {object}        User object
 */
export function getUser( state, userId ) {
	return state.users.items[ userId ];
}
