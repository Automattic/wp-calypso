/*
 */

import { shouldShowComments } from 'calypso/blocks/comments/helper';
import { isDiscoverPost } from 'calypso/reader/discover/helper';

export function shouldShowConversationFollowButton( post ) {
	return (
		post.site_ID && ! post.is_external && shouldShowComments( post ) && ! isDiscoverPost( post )
	);
}
