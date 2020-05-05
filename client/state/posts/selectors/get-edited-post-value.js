/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import { getEditedPost } from 'state/posts/selectors/get-edited-post';

import 'state/posts/init';

/**
 * Returns the assigned value for the edited post by field key.
 *
 * @param   {object} state  Global state tree
 * @param   {number} siteId Site ID
 * @param   {number} postId Post ID
 * @param   {string} field  Field value to retrieve
 * @returns {*}             Field value
 */
export function getEditedPostValue( state, siteId, postId, field ) {
	return get( getEditedPost( state, siteId, postId ), field );
}
