/** @ssr-ready **/

/**
 * Returns a user object by user ID.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} userId User ID
 * @return {Object}        User object
 */
export function getUser( state, userId ) {
	return state.users.items[ userId ];
}

export function isNewUser( state, userId ) {
	const user = getUser( state, userId );
	console.log( 'user: %o', user );
}
