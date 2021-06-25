/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getPost } from 'calypso/state/posts/selectors/get-post';

import 'calypso/state/posts/init';

/**
 * Returns whether the current user can edit the post with the given global ID.
 *
 * @param  {object}  state    Global state tree
 * @param  {string}  globalId Post global ID
 * @returns {boolean}          Whether the current user can edit the given post
 */
export function canCurrentUserEditPost( state, globalId ) {
	const post = getPost( state, globalId );
	return get( post, [ 'capabilities', 'edit_post' ], null );
}
