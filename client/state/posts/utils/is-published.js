/**
 * Internal dependencies
 */
import { isBackDatedPublished } from 'calypso/state/posts/utils/is-back-dated-published';

// Return published status of a post. Optionally, the `status` can be overridden
// with a custom value: what would the post status be if a `status` edit was applied?
export function isPublished( post, status ) {
	if ( ! post ) {
		return false;
	}

	const effectiveStatus = status || post.status;

	return (
		effectiveStatus === 'publish' ||
		effectiveStatus === 'private' ||
		isBackDatedPublished( post, status )
	);
}
