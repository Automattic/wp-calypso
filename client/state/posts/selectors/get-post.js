import 'calypso/state/posts/init';

/**
 * Returns a post object by its global ID.
 *
 * @param   {Object} state    Global state tree
 * @param   {string} globalId Post global ID
 * @returns {Object}          Post object
 */
export function getPost( state, globalId ) {
	const path = state.posts.items[ globalId ];
	if ( ! path ) {
		return null;
	}

	const [ siteId, postId ] = path;
	const manager = state.posts.queries[ siteId ];
	if ( ! manager ) {
		return null;
	}

	return manager.getItem( postId );
}
