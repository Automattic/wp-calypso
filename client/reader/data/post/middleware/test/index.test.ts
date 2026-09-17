import { QueryClient } from '@tanstack/react-query';
import { READER_CONVERSATION_UPDATE_FOLLOW_STATUS } from 'calypso/state/reader/action-types';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { createPostCacheMiddleware } from '..';
import { getCachedPost, upsertPostCache } from '../../cache';

describe( 'reader post cache middleware', () => {
	let queryClient: QueryClient;

	const dispatch = ( action: Record< string, unknown > ) => {
		return createPostCacheMiddleware( () => queryClient )( {} as never )(
			( nextAction ) => nextAction
		)( action );
	};

	beforeEach( () => {
		queryClient = new QueryClient();
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				feed_ID: 200,
				feed_URL: 'https://example.com/feed',
				global_ID: 'global-1',
				i_like: false,
				like_count: 0,
				is_seen: false,
				is_following_conversation: false,
			},
		] );
	} );

	it( 'patches conversation follow state', () => {
		dispatch( {
			type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
			payload: {
				siteId: 100,
				postId: 1,
				followStatus: CONVERSATION_FOLLOW_STATUS.following,
			},
		} );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_following_conversation: true,
		} );

		dispatch( {
			type: READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
			payload: {
				siteId: 100,
				postId: 1,
				followStatus: CONVERSATION_FOLLOW_STATUS.not_following,
			},
		} );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_following_conversation: false,
		} );
	} );
} );
