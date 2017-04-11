/**
 * External dependencies
 */
import { some, trim } from 'lodash';

/**
 * Internal dependencies
 */
import { getEditedPost } from 'state/posts/selectors';

const REGEXP_EMPTY_CONTENT = /^<p>(<br[^>]*>|&nbsp;|\s)*<\/p>$/;
const CONTENT_LENGTH_ASSUME_SET = 50;

/**
 * Check if the content is empty (ignoring empty tags)
 * @param  {string}  content Raw post content
 * @return {Boolean}         Whether it's considered empty
 */
export function isEmptyContent( content ) {
	return ! content || ( content.length < CONTENT_LENGTH_ASSUME_SET && REGEXP_EMPTY_CONTENT.test( content ) );
}

/**
  * Returns true if the edited post has content
  * (title, excerpt or content not empty)
  *
  * @param  {Object}  state  Global state tree
  * @param  {Number}  siteId Site ID
  * @param  {Number}  postId Post ID
  * @return {Boolean}        Whether the edited post has content or not
 */
export default function editedPostHasContent( state, siteId, postId ) {
	const editedPost = getEditedPost( state, siteId, postId );
	return (
		!! editedPost &&
		(
			some( [ 'title', 'excerpt' ], field => editedPost[ field ] && !! trim( editedPost[ field ] ) ) ||
			// We don't yet have the notion of post's raw content in the Redux state so we rely on post content attribute here
			// when we do, we'll want it to reflect the Flux implementation's emptiness check
			// where raw content is preferred to the content property if available
			! isEmptyContent( editedPost.content )
		)
	);
}
