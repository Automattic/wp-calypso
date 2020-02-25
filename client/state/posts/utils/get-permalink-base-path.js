/**
 * Internal dependencies
 */
import { isPublished } from './is-published';
import { removeSlug } from './remove-slug';

export function getPermalinkBasePath( post ) {
	if ( ! post ) {
		return;
	}

	let path = post.URL;

	// if we have a permalink_URL, utlize that
	if ( ! isPublished( post ) && post.other_URLs && post.other_URLs.permalink_URL ) {
		path = post.other_URLs.permalink_URL;
	}

	return removeSlug( path );
}
