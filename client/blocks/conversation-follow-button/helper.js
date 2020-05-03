/*
 */

/**
 * Internal dependencies
 */
import { isDiscoverPost } from 'reader/discover/helper';
import { shouldShowComments } from 'blocks/comments/helper';

export function shouldShowConversationFollowButton( post ) {
	return (
		post.site_ID && ! post.is_external && shouldShowComments( post ) && ! isDiscoverPost( post )
	);
}
