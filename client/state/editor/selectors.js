/**
 * Internal dependencies
 */
import { getSitePost } from 'state/posts/selectors';

/**
 * Returns a post object by site ID post ID pairing, with editor revisions.
 *
 * @param  {Object} state  Global state tree
 * @param  {Number} siteId Site ID
 * @param  {Number} postId Post ID
 * @return {Object}        Post object with revisions
 */
export function getEditedPost( state, siteId, postId ) {
	const post = getSitePost( state, siteId, postId );
	if ( ! state.editor.posts[ siteId ] ) {
		return post;
	}

	const edits = state.editor.posts[ siteId ][ postId || '' ];
	if ( ! postId ) {
		return edits || null;
	}

	return Object.assign( {}, post, edits );
}
