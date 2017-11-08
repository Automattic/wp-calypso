/** @format */

/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getPost } from 'state/posts/selectors';
import { getPostType } from 'state/post-types/selectors';
import { getCurrentUserId, isValidCapability } from 'state/current-user/selectors';
import { canCurrentUser } from 'state/selectors';

/**
 * Returns whether the current user can edit the post with the given global ID.
 *
 * @param  {Object}  state    Global state tree
 * @param  {String}  globalId Post global ID
 * @return {Boolean}          Whether the current user can edit the given post
 */
export default function canCurrentUserEditPost( state, globalId ) {
	const post = getPost( state, globalId );
	if ( ! post ) {
		return null;
	}

	const type = getPostType( state, post.site_ID, post.type );
	const userId = getCurrentUserId( state );
	const isAuthor = get( post.author, 'ID' ) === userId;

	let capability = isAuthor ? 'edit_posts' : 'edit_others_posts';
	const typeCapability = get( type, [ 'capabilities', capability ] );
	if ( isValidCapability( state, post.site_ID, typeCapability ) ) {
		capability = typeCapability;
	}

	return canCurrentUser( state, post.site_ID, capability );
}
