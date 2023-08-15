import { shouldShowComments } from 'calypso/blocks/comments/helper';

export function shouldShowConversationFollowButton( post ) {
	return post.site_ID && ! post.is_external && shouldShowComments( post );
}
