/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getPost } from 'state/posts/selectors';

/**
 * Returns whether the current user can edit the post with the given global ID.
 *
 * @param  {object}  state    Global state tree
 * @param  {string}  globalId Post global ID
 * @returns {boolean}          Whether the current user can edit the given post
 */
export default function canCurrentUserEditPost( state, globalId ) {
	const post = getPost( state, globalId );
	return get( post, [ 'capabilities', 'edit_post' ], null );
}
