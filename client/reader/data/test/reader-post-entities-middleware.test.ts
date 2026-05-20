import { postLikesQuery } from '@automattic/api-queries';
import { QueryClient } from '@tanstack/react-query';
import { applyMiddleware, createStore } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import {
	READER_CONVERSATION_UPDATE_FOLLOW_STATUS,
	READER_SEEN_MARK_AS_SEEN_RECEIVE,
	READER_SEEN_MARK_AS_UNSEEN_RECEIVE,
} from 'calypso/state/reader/action-types';
import { CONVERSATION_FOLLOW_STATUS } from 'calypso/state/reader/conversations/follow-status';
import { receivePosts } from 'calypso/state/reader/posts/actions';
import { receiveMarkAllAsSeen } from 'calypso/state/reader/seen-posts/actions';
import {
	getReaderPostEntity,
	updateReaderPostLocalState,
	upsertReaderPostEntities,
} from '../reader-post-entities';
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

	it( 'ingests posts from the real receivePosts Redux bridge without overwriting local like overlays', async () => {
		const store = createStore(
			( state = {} ) => state,
			applyMiddleware(
				thunkMiddleware,
				createReaderPostEntitiesMiddleware( () => queryClient )
			)
		);

		updateReaderPostLocalState( queryClient, { blogId: 100, postId: 1 }, ( post ) => ( {
			i_like: true,
			like_count: Number( post?.like_count ?? 0 ) + 1,
		} ) );

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

	it( 'seeds the post likes query from received Reader post data', async () => {
		const store = createStore(
			( state = {} ) => state,
			applyMiddleware(
				thunkMiddleware,
				createReaderPostEntitiesMiddleware( () => queryClient )
			)
		);

		await store.dispatch(
			receivePosts( [
				{
					ID: 2,
					site_ID: 100,
					global_ID: 'global-2',
					i_like: true,
					like_count: 72,
				},
			] ) as never
		);

		expect( queryClient.getQueryData( postLikesQuery( 100, 2 ).queryKey ) ).toEqual( {
			found: 72,
			iLike: true,
			likes: [],
		} );
		expect( queryClient.getQueryState( postLikesQuery( 100, 2 ).queryKey )?.dataUpdatedAt ).toBe(
			0
		);
	} );

	it( 'does not overwrite existing post likes query data when receiving Reader posts', async () => {
		queryClient.setQueryData( postLikesQuery( 100, 1 ).queryKey, {
			found: 73,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );

		const store = createStore(
			( state = {} ) => state,
			applyMiddleware(
				thunkMiddleware,
				createReaderPostEntitiesMiddleware( () => queryClient )
			)
		);

		await store.dispatch(
			receivePosts( [
				{
					ID: 1,
					site_ID: 100,
					global_ID: 'global-1',
					i_like: false,
					like_count: 72,
				},
			] ) as never
		);

		expect( queryClient.getQueryData( postLikesQuery( 100, 1 ).queryKey ) ).toEqual( {
			found: 73,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
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
