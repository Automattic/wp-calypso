/**
 * Internal dependencies
 *
 * @format
 */

import * as DiscoverHelper from 'reader/discover/helper';

export function shouldShowComments( post ) {
	if ( isCommentableDiscoverPost( post ) ) {
		return true;
	}
	if ( post.discussion && ( post.discussion.comments_open || post.discussion.comment_count > 0 ) ) {
		console.log( 'post.discussion', post.discussion );
		console.log( 'post.discussion.comment_count', post.discussion.comment_count );
		console.log( 'comments open', post.discussion.comments_open );
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
