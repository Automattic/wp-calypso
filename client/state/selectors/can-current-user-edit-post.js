/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getPost } from 'client/state/posts/selectors';

/**
 * Returns whether the current user can edit the post with the given global ID.
 *
 * @param  {Object}  state    Global state tree
 * @param  {String}  globalId Post global ID
 * @return {Boolean}          Whether the current user can edit the given post
 */
export default function canCurrentUserEditPost( state, globalId ) {
	const post = getPost( state, globalId );
	return get( post, [ 'capabilities', 'edit_post' ], null );
}
