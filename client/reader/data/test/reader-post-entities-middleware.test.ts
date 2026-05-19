import { QueryClient } from '@tanstack/react-query';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import {
	POST_LIKE,
	POST_LIKES_ADD_LIKER,
	POST_LIKES_RECEIVE,
	POST_LIKES_REMOVE_LIKER,
	POST_UNLIKE,
} from 'calypso/state/action-types';
import {
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
	READER_POSTS_RECEIVE,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
} from 'calypso/state/reader/action-types';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { receiveMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import { getReaderPostEntity, upsertReaderPostEntities } from '../reader-post-entities';
import { createReaderPostEntitiesMiddleware } from '../reader-post-entities-middleware';

describe( 'reader post entities middleware', () => {
	let queryClient: QueryClient;

	const dispatch = ( action: Record< string, unknown > ) => {
		return createReaderPostEntitiesMiddleware( () => queryClient )( {} as never )(
			( nextAction ) => nextAction
		)( action );
	};

	beforeEach( () => {
		queryClient = new QueryClient();
		upsertReaderPostEntities( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				i_like: false,
				like_count: 0,
				is_seen: false,
				is_following_conversation: false,
			},
		] );
	} );

	it( 'optimistically patches like and unlike state', () => {
		dispatch( { type: POST_LIKE, siteId: 100, postId: 1 } );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: true,
			like_count: 1,
		} );

		dispatch( { type: POST_UNLIKE, siteId: 100, postId: 1 } );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: false,
			like_count: 0,
		} );
	} );

	it( 'patches authoritative like receive responses', () => {
		dispatch( { type: POST_LIKES_RECEIVE, siteId: 100, postId: 1, iLike: true, found: 12 } );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: true,
			like_count: 12,
		} );
	} );

	it( 'keeps like state from optimistic actions when liker responses arrive', () => {
		dispatch( { type: POST_LIKE, siteId: 100, postId: 1 } );
		dispatch( { type: POST_LIKES_ADD_LIKER, siteId: 100, postId: 1, likeCount: 12 } );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: true,
			like_count: 1,
		} );

		dispatch( { type: POST_UNLIKE, siteId: 100, postId: 1 } );
		dispatch( { type: POST_LIKES_REMOVE_LIKER, siteId: 100, postId: 1, likeCount: 11 } );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: false,
			like_count: 0,
		} );
	} );

	it( 'keeps the optimistic unlike count when the remove-liker response returns the stale count', () => {
		upsertReaderPostEntities( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				i_like: true,
				like_count: 72,
			},
		] );

		dispatch( { type: POST_UNLIKE, siteId: 100, postId: 1 } );
		dispatch( { type: POST_LIKES_REMOVE_LIKER, siteId: 100, postId: 1, likeCount: 72 } );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: false,
			like_count: 71,
		} );
	} );

	it( 'does not patch like responses derived from post ingestion', () => {
		dispatch( { type: POST_LIKE, siteId: 100, postId: 1 } );
		dispatch( {
			type: POST_LIKES_RECEIVE,
			siteId: 100,
			postId: 1,
			iLike: false,
			found: 0,
			meta: { source: READER_POSTS_RECEIVE },
		} );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: true,
			like_count: 1,
		} );
	} );

	it( 'ingests posts from the real receivePosts Redux bridge without overwriting local like overlays', async () => {
		const store = createStore(
			( state = {} ) => state,
			applyMiddleware(
				thunkMiddleware,
				createReaderPostEntitiesMiddleware( () => queryClient )
			)
		);

		dispatch( { type: POST_LIKE, siteId: 100, postId: 1 } );

		await store.dispatch(
			receivePosts( [
				{
					ID: 1,
					site_ID: 100,
					global_ID: 'global-1',
					title: 'Updated title',
					i_like: false,
					like_count: 0,
				},
			] ) as never
		);

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			title: 'Updated title',
			i_like: true,
			like_count: 1,
		} );
	} );

	it( 'patches like state through feed aliases', () => {
		upsertReaderPostEntities( queryClient, [
			{
				ID: 2,
				site_ID: 100,
				feed_ID: 200,
				feed_item_ID: 300,
				global_ID: 'global-2',
				i_like: false,
				like_count: 0,
			},
		] );

		dispatch( { type: POST_LIKE, siteId: 100, postId: 2 } );

		expect( getReaderPostEntity( queryClient, { feedId: 200, postId: 300 } ) ).toMatchObject( {
			i_like: true,
			like_count: 1,
		} );
	} );

	it( 'patches seen state by global id', () => {
		dispatch( { type: READER_SEEN_MARK_AS_SEEN_RECEIVE, globalIds: [ 'global-1' ] } );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_seen: true,
		} );

		dispatch( { type: READER_SEEN_MARK_AS_UNSEEN_RECEIVE, globalIds: [ 'global-1' ] } );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_seen: false,
		} );
	} );

	it( 'patches mark-all-as-seen state by global id', () => {
		dispatch( receiveMarkAllAsSeen( { feedIds: [], feedUrls: [], globalIds: [ 'global-1' ] } ) );

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_seen: true,
		} );
	} );

	it( 'patches seen state across aliases with the same global id', () => {
		upsertReaderPostEntities( queryClient, [
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

		expect( getReaderPostEntity( queryClient, { blogId: 101, postId: 2 } ) ).toMatchObject( {
			is_seen: true,
		} );
		expect( getReaderPostEntity( queryClient, { feedId: 201, postId: 301 } ) ).toMatchObject( {
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

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
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

		expect( getReaderPostEntity( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			is_following_conversation: false,
		} );
	} );
} );
