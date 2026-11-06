import { wpcom } from '../wpcom-fetcher';
import type { ReadConversationUnfollowResponse } from './types';

/** Removes the user's follow or mute row for the conversation. */
export const unfollowReadConversation = ( {
	blogId,
	postId,
}: {
	blogId: number;
	postId: number;
} ): Promise< ReadConversationUnfollowResponse > =>
	wpcom.req.post( {
		path: `/read/sites/${ encodeURIComponent( blogId ) }/posts/${ encodeURIComponent(
			postId
		) }/unfollow`,
		apiNamespace: 'wpcom/v2',
	} );
