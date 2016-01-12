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

/**
 * Returns true if the specified posts query is being tracked for the site, or
 * false otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {Boolean}        Whether posts query is tracked for site
 */
export function isTrackingSitePostsQuery( state, siteId, query ) {
	const { siteQueries } = state.posts;
	if ( ! siteQueries[ siteId ] ) {
		return false;
	}

	return !! siteQueries[ siteId ][ JSON.stringify( query ) ];
}

/**
 * Returns an array of posts for the posts query, or null if no posts have been
 * received.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {?Array}         Posts for the post query
 */
export function getSitePostsForQuery( state, siteId, query ) {
	const { siteQueries } = state.posts;
	if ( ! isTrackingSitePostsQuery( state, siteId, query ) ) {
		return null;
	}

	query = JSON.stringify( query );
	if ( ! siteQueries[ siteId ][ query ].posts ) {
		return null;
	}

	return siteQueries[ siteId ][ query ].posts.map( ( globalId ) => {
		return getPost( state, globalId );
	} );
}

/**
 * Returns true if currently requesting posts for the posts query, or false
 * otherwise.
 *
 * @param  {Object}  state  Global state tree
 * @param  {Number}  siteId Site ID
 * @param  {Object}  query  Post query object
 * @return {Boolean}        Whether posts are being requested
 */
export function isRequestingSitePostsForQuery( state, siteId, query ) {
	if ( ! isTrackingSitePostsQuery( state, siteId, query ) ) {
		return false;
	}

	query = JSON.stringify( query );
	return state.posts.siteQueries[ siteId ][ query ].fetching;
}
