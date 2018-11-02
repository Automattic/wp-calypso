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

/**
 * Returns the Publicize services available for connection.
 *
 * @param {Object} state Publicize state.
 *
 * @return {?Array} List of services.
 */
export function getServices( state ) {
	return state.services;
};
