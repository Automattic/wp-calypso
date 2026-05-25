import { QueryClient } from '@tanstack/react-query';
import {
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
} from 'calypso/state/reader/action-types';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { receiveMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { getCachedPost, upsertPostCache } from '../post-cache';
import { createPostCacheMiddleware } from '../post-cache-middleware';

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

	it( 'patches seen state by global id', () => {
		dispatch( { type: READER_SEEN_MARK_AS_SEEN_RECEIVE, globalIds: [ 'global-1' ] } );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_seen: true,
		} );

		dispatch( { type: READER_SEEN_MARK_AS_UNSEEN_RECEIVE, globalIds: [ 'global-1' ] } );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_seen: false,
		} );
	} );

	it( 'patches mark-all-as-seen state by global id', () => {
		dispatch( receiveMarkAllAsSeen( { feedIds: [], feedUrls: [], globalIds: [ 'global-1' ] } ) );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_seen: true,
		} );
	} );

	it( 'patches mark-all-as-seen state by feed when stream global ids are unavailable', () => {
		dispatch(
			receiveMarkAllAsSeen( {
				feedIds: [ 200 ],
				feedUrls: [ 'https://example.com/feed' ],
				globalIds: [],
			} )
		);

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_seen: true,
		} );
	} );

	it( 'patches seen state across aliases with the same global id', () => {
		upsertPostCache( queryClient, [
			{
				ID: 2,
				site_ID: 101,
				feed_ID: 201,
				feed_item_ID: 301,
				global_ID: 'global-2',
				is_seen: false,
			},
		] );

		dispatch( { type: READER_SEEN_MARK_AS_SEEN_RECEIVE, globalIds: [ 'global-2' ] } );

		expect( getCachedPost( queryClient, { blogId: 101, postId: 2 } ) ).toMatchObject( {
			is_seen: true,
		} );
		expect( getCachedPost( queryClient, { feedId: 201, postId: 301 } ) ).toMatchObject( {
			is_seen: true,
		} );
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
