/**
 * Internal dependencies
 */
import { getPermalinkBasePath } from 'state/posts/utils/get-permalink-base-path';
import { isPublished } from 'state/posts/utils/is-published';
import { removeSlug } from 'state/posts/utils/remove-slug';

export function getPagePath( post ) {
	if ( ! post ) {
		return;
	}
	if ( ! isPublished( post ) ) {
		return getPermalinkBasePath( post );
	}

	return removeSlug( post.URL );
}
