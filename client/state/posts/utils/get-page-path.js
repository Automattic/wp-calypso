/**
 * Internal dependencies
 */
import { isPublished } from './is-published';
import { removeSlug } from './remove-slug';
import { getPermalinkBasePath } from './get-permalink-base-path';

export function getPagePath( post ) {
	if ( ! post ) {
		return;
	}
	if ( ! isPublished( post ) ) {
		return getPermalinkBasePath( post );
	}

	return removeSlug( post.URL );
}
