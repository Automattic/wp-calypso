/**
 * Returns the Publicize connections for a post.
 *
 * @param {Object} state  Publicize state.
 * @param {Number} postId ID of the post.
 *
 * @return {?Array} List of connections.
 */
export function getConnections( state, postId ) {
	return state.connections[ postId ] || null;
};
