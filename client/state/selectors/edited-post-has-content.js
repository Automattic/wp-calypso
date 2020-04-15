/**
 * External dependencies
 */

import { some, trim } from 'lodash';

/**
 * Internal dependencies
 */
import { getEditedPost } from 'state/posts/selectors';
import { getEditorRawContent } from 'state/ui/editor/selectors';

import 'state/posts/init';

const REGEXP_EMPTY_CONTENT = /^<p>(<br[^>]*>|&nbsp;|\s)*<\/p>$/;
const CONTENT_LENGTH_ASSUME_SET = 50;

/**
 * Check if the content is empty (ignoring empty tags)
 *
 * @param  {string}  content Raw post content
 * @returns {boolean}         Whether it's considered empty
 */
export function isEmptyContent( content ) {
	return (
		! content ||
		( content.length < CONTENT_LENGTH_ASSUME_SET && REGEXP_EMPTY_CONTENT.test( content ) )
	);
}

/**
 * Returns true if the edited post has content
 * (title, excerpt or content not empty)
 *
 * @param  {object}  state  Global state tree
 * @param  {number}  siteId Site ID
 * @param  {number}  postId Post ID
 * @returns {boolean}        Whether the edited post has content or not
 */
export default function editedPostHasContent( state, siteId, postId ) {
	const editedPost = getEditedPost( state, siteId, postId );

	if ( ! editedPost ) {
		return false;
	}

	if ( some( [ 'title', 'excerpt' ], ( field ) => trim( editedPost[ field ] ) ) ) {
		return true;
	}

	const rawContent = getEditorRawContent( state );
	if ( rawContent ) {
		// Raw content contains the most up-to-date post content
		return ! isEmptyContent( rawContent );
	}

	return ! isEmptyContent( editedPost.content );
}
