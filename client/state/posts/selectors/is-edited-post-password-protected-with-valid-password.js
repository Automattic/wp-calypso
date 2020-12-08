/**
 * Internal dependencies
 */
import { getEditedPostValue } from 'calypso/state/posts/selectors/get-edited-post-value';

import 'calypso/state/posts/init';

/**
 * Returns true if the edited post is password protected and has a valid password set
 *
 * @param   {object}  state  Global state tree
 * @param   {number}  siteId Site ID
 * @param   {number}  postId Post ID
 * @returns {boolean}        Result of the check
 */
export function isEditedPostPasswordProtectedWithValidPassword( state, siteId, postId ) {
	const password = getEditedPostValue( state, siteId, postId, 'password' );
	return !! ( password && password.trim().length > 0 );
}
