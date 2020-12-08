/*
 */

/**
 * Internal dependencies
 */
import * as DiscoverHelper from 'calypso/reader/discover/helper';

export function shouldShowComments( post ) {
	if ( isCommentableDiscoverPost( post ) ) {
		return true;
	}

	if ( post.discussion && ( post.discussion.comments_open || post.discussion.comment_count > 0 ) ) {
		return true;
	}

	return false;
}

export function isCommentableDiscoverPost( post ) {
	const isDiscoverPost = DiscoverHelper.isDiscoverPost( post );

	if ( isDiscoverPost ) {
		if (
			DiscoverHelper.isInternalDiscoverPost( post ) &&
			! DiscoverHelper.isDiscoverSitePick( post )
		) {
			return true;
		}
	}

	return false;
}
