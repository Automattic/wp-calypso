import keyBy from 'lodash/keyBy';
import filter from 'lodash/filter';

/**
 * Returns a single post.
 *
 * @param  {Object}  state  Global state tree
 * @param  {String}  postGlobalId Post global ID
 * @return {Object} Post
 */
export function getPost( state, postGlobalId ) {
	return state.reader.posts.items[ postGlobalId ];
}

let previousItems = null,
	postMapBySiteAndPost = {};
/**
 * Get a single post by site ID and post ID
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post ID
 * @return {object}        Post object. Undefined if missing.
 */
export function getPostBySiteAndId( state, siteId, postId ) {
	if ( state.reader.posts.items !== previousItems ) {
		/*
		 * Create a memoized map of posts by site ID and post ID
		 * Invalidate it when the items map changes to a new instance
		 * Didn't use createSelector here because it memoizes per argument,
		 * which would create a cache per item, instead of one map with all the
		 * items. Doing it this way is still fast (map lookup instead of array search)
		 * and saves memory in the common case.
		 */
		const items = state.reader.posts.items,
			// only internal (wpcom / jetpack) posts have a valid site_ID and post ID
			internalPosts = filter( items, post => post && post.site_ID && post.ID && ! post.is_external );

		postMapBySiteAndPost = keyBy( internalPosts, post => {
			return `${ post.site_ID }-${ post.ID }`;
		} );

		previousItems = items;
	}

	return postMapBySiteAndPost[ `${ siteId }-${ postId }` ];
}
