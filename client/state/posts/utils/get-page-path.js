/**
 * Internal dependencies
 */
import { getPermalinkBasePath } from 'calypso/state/posts/utils/get-permalink-base-path';
import { isPublished } from 'calypso/state/posts/utils/is-published';
import { removeSlug } from 'calypso/state/posts/utils/remove-slug';

export function getPagePath( post ) {
	if ( ! post ) {
		return;
	}
	if ( ! isPublished( post ) ) {
		return getPermalinkBasePath( post );
	}

	return removeSlug( post.URL );
}
