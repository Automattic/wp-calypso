/**
 * Returns a post object by its global ID.
 *
 * @param  {Object} state    Global state tree
 * @param  {String} globalId Post global ID
 * @return {Object}          Post object
 */
export function getPost( state, globalId ) {
	return state.posts.items[ globalId ];
}

/**
 * Returns a post object by site ID, post ID pair.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {String}  postId Post ID
 * @return {?Object}        Post object
 */
export function getSitePost( state, siteId, postId ) {
	const { sitePosts } = state.posts;
	if ( ! sitePosts[ siteId ] || ! sitePosts[ siteId ][ postId ] ) {
		return null;
	}

	return getPost( state, sitePosts[ siteId ][ postId ] );
}
