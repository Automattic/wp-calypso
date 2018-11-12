/** @format */

/**
 * Builds the API endpoint path for retrieving the Publicize connections for a post.
 *
 * @param {Number} postId Post ID.
 *
 * @return {String} API endpoint path.
 */
export function getFetchConnectionsPath( postId ) {
	return '/wp/v2/posts/' + postId.toString() + '/?context=edit';
}
