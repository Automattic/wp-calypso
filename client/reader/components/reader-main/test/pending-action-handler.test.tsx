/**
 * @jest-environment jsdom
 */
import { postLikesQuery } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import nock from 'nock';
import { act } from 'react';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import { getCachedPost, upsertPostCache } from 'calypso/reader/data/post/cache';
import { READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN } from 'calypso/state/reader-ui/action-types';
import { clearLastActionRequiresLogin } from 'calypso/state/reader-ui/actions';
import { ReaderPendingActionHandler } from '../pending-action-handler';

const BASE = 'https://public-api.wordpress.com';

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

type TestState = {
	currentUser: { id: number };
	readerUi: {
		persistedLastActionPriorToLogin: {
			type: string;
			siteId: number;
			postId: number;
			commentId?: number;
		} | null;
	};
};

const renderWithProviders = (
	queryClient: QueryClient,
	state: TestState,
	onAction: ( action: { type: string } ) => void = () => {}
) => {
	const reducer = ( currentState: TestState = state, action: { type: string } ): TestState => {
		onAction( action );

		if ( action.type === READER_CLEAR_LAST_ACTION_REQUIRES_LOGIN ) {
			return {
				...currentState,
				readerUi: {
					...currentState.readerUi,
					persistedLastActionPriorToLogin: null,
				},
			};
		}

		return currentState;
	};
	const store = createStore( reducer );

	return render(
		<Provider store={ store }>
			<QueryClientProvider client={ queryClient }>
				<ReaderPendingActionHandler />
			</QueryClientProvider>
		</Provider>
	);
};

describe( 'ReaderPendingActionHandler', () => {
	afterEach( () => {
		jest.useRealTimers();
		nock.cleanAll();
	} );

	it( 'replays a pending unlike through the Reader post like adapter', async () => {
		jest.useFakeTimers();
		const queryClient = makeQueryClient();
		const clearedActions: Array< { type: string } > = [];
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				i_like: true,
				like_count: 72,
			},
		] );
		queryClient.setQueryData( postLikesQuery( 100, 1 ).queryKey, {
			found: 72,
			iLike: true,
			likes: [ { ID: 1, login: 'alice' } ],
		} );

		const unlikeScope = nock( BASE )
			.post( '/rest/v1.1/sites/100/posts/1/likes/mine/delete', {} )
			.reply( 200, {
				success: true,
				like_count: '71',
				liker: { ID: 1, login: 'alice' },
			} );

		renderWithProviders(
			queryClient,
			{
				currentUser: { id: 1 },
				readerUi: {
					persistedLastActionPriorToLogin: { type: 'unlike', siteId: 100, postId: 1 },
				},
			},
			( action ) => clearedActions.push( action )
		);

		act( () => {
			jest.advanceTimersByTime( 2000 );
		} );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: false,
			like_count: 71,
		} );
		expect( clearedActions ).toContainEqual( clearLastActionRequiresLogin() );

		jest.useRealTimers();
		await waitFor( () => expect( unlikeScope.isDone() ).toBe( true ) );
	} );

	it( 'replays a pending like through the Reader post like adapter', async () => {
		jest.useFakeTimers();
		const queryClient = makeQueryClient();
		const clearedActions: Array< { type: string } > = [];
		upsertPostCache( queryClient, [
			{
				ID: 1,
				site_ID: 100,
				global_ID: 'global-1',
				i_like: false,
				like_count: 72,
			},
		] );
		queryClient.setQueryData( postLikesQuery( 100, 1 ).queryKey, {
			found: 72,
			iLike: false,
			likes: [],
		} );

		const likeScope = nock( BASE )
			.post( '/rest/v1.1/sites/100/posts/1/likes/new', {} )
			.reply( 200, {
				success: true,
				like_count: '73',
				liker: { ID: 1, login: 'alice' },
			} );

		renderWithProviders(
			queryClient,
			{
				currentUser: { id: 1 },
				readerUi: {
					persistedLastActionPriorToLogin: { type: 'like', siteId: 100, postId: 1 },
				},
			},
			( action ) => clearedActions.push( action )
		);

		act( () => {
			jest.advanceTimersByTime( 2000 );
		} );

		expect( getCachedPost( queryClient, { blogId: 100, postId: 1 } ) ).toMatchObject( {
			i_like: true,
			like_count: 73,
		} );
		expect( clearedActions ).toContainEqual( clearLastActionRequiresLogin() );

		jest.useRealTimers();
		await waitFor( () => expect( likeScope.isDone() ).toBe( true ) );
	} );

	it( 'replays a pending comment like through the Reader comment like adapter', async () => {
		jest.useFakeTimers();
		const queryClient = makeQueryClient();
		const clearedActions: Array< { type: string } > = [];

		const likeScope = nock( BASE )
			.post( '/rest/v1.1/sites/100/comments/5/likes/new', {} )
			.reply( 200, {
				success: true,
				like_count: '9',
			} );

		renderWithProviders(
			queryClient,
			{
				currentUser: { id: 1 },
				readerUi: {
					persistedLastActionPriorToLogin: {
						type: 'comment-like',
						siteId: 100,
						postId: 1,
						commentId: 5,
					},
				},
			},
			( action ) => clearedActions.push( action )
		);

		act( () => {
			jest.advanceTimersByTime( 2000 );
		} );

		expect( clearedActions ).toContainEqual( clearLastActionRequiresLogin() );

		jest.useRealTimers();
		await waitFor( () => expect( likeScope.isDone() ).toBe( true ) );
	} );

	it( 'does not replay a pending comment like without a comment id', async () => {
		jest.useFakeTimers();
		const queryClient = makeQueryClient();
		const clearedActions: Array< { type: string } > = [];

		const malformedLikeScope = nock( BASE )
			.post( '/rest/v1.1/sites/100/comments/undefined/likes/new', {} )
			.reply( 200, {
				success: true,
				like_count: '9',
			} );

		renderWithProviders(
			queryClient,
			{
				currentUser: { id: 1 },
				readerUi: {
					persistedLastActionPriorToLogin: {
						type: 'comment-like',
						siteId: 100,
						postId: 1,
					},
				},
			},
			( action ) => clearedActions.push( action )
		);

		act( () => {
			jest.advanceTimersByTime( 2000 );
		} );

		jest.useRealTimers();
		await waitFor( () => expect( queryClient.isMutating() ).toBe( 0 ) );

		expect( malformedLikeScope.isDone() ).toBe( false );
		expect( clearedActions ).toContainEqual( clearLastActionRequiresLogin() );
	} );
} );
