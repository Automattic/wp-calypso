/**
 * @jest-environment jsdom
 */
import { patchFollow, getFollowsQueryKey, type FollowsInfiniteData } from '@automattic/api-queries';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import * as selectors from '../use-follow-selectors';
import { useFollowForBlog, useFollowForFeed, useIsFollowing } from '../use-follow-selectors';
import { useFollows } from '../use-follows';
import type { FollowItem } from '@automattic/api-core';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

type TestState = {
	currentUser: {
		id: number | null;
	};
};

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const makeWrapper = ( client: QueryClient, state: TestState = { currentUser: { id: 1 } } ) => {
	const store = createStore( ( currentState = state ) => currentState );

	return function Wrapper( { children }: { children: ReactNode } ) {
		return (
			<Provider store={ store }>
				<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
			</Provider>
		);
	};
};

const makeData = (
	follows: FollowItem[] = [],
	totalCount = follows.length
): FollowsInfiniteData => ( {
	pages: [
		{
			follows,
			totalCount,
			page: 1,
			number: 200,
		},
	],
	pageParams: [ 1 ],
} );

const makeFollow = ( overrides: Partial< FollowItem > = {} ): FollowItem => ( {
	URL: 'https://example.com/feed/',
	feed_URL: 'https://example.com/feed/',
	blog_ID: 123,
	feed_ID: 456,
	is_following: true,
	...overrides,
} );

describe( 'follows hooks', () => {
	afterEach( () => nock.cleanAll() );

	it( 'useFollows derives follows and count from the query cache', async () => {
		const queryClient = makeQueryClient();
		const follow = makeFollow();
		queryClient.setQueryData( getFollowsQueryKey(), makeData( [ follow ], 7 ) );

		const { result } = renderHook( () => useFollows(), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.follows ).toEqual( [ follow ] );
		expect( result.current.count ).toBe( 7 );
	} );

	it( 'does not fetch follows while the current user is logged out', async () => {
		const queryClient = makeQueryClient();
		const scope = nock( BASE ).get( '/rest/v1.2/read/following/mine' ).query( true ).reply( 200, {
			subscriptions: [],
			total_subscriptions: 0,
			page: 1,
			number: 200,
		} );

		const { result } = renderHook( () => useFollows(), {
			wrapper: makeWrapper( queryClient, { currentUser: { id: null } } ),
		} );

		await act( async () => {
			await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		} );

		expect( result.current.follows ).toEqual( [] );
		expect( result.current.count ).toBe( 0 );
		expect( scope.isDone() ).toBe( false );
	} );

	it( 'does not fetch additional follows pages by default', async () => {
		const queryClient = makeQueryClient();
		const firstPage = Array.from( { length: 200 }, ( _value, index ) =>
			makeFollow( {
				ID: index + 1,
				feed_ID: index + 1,
				feed_URL: `https://example.com/feed-${ index + 1 }/`,
				URL: `https://example.com/feed-${ index + 1 }/`,
			} )
		);
		const firstPageScope = nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( ( query ) => query.page === '1' )
			.reply( 200, {
				subscriptions: firstPage.map( ( follow ) => ( {
					ID: follow.ID,
					URL: follow.URL,
					feed_URL: follow.feed_URL,
					feed_ID: follow.feed_ID,
				} ) ),
				total_subscriptions: 201,
				page: 1,
				number: 200,
			} );
		const secondPageScope = nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( ( query ) => query.page === '2' )
			.reply( 200, {
				subscriptions: [
					{
						ID: 201,
						URL: 'https://example.com/feed-201/',
						feed_URL: 'https://example.com/feed-201/',
						feed_ID: 201,
					},
				],
				total_subscriptions: 201,
				page: 2,
				number: 200,
			} );

		renderHook( () => useFollows(), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( firstPageScope.isDone() ).toBe( true ) );
		await act( async () => {
			await new Promise( ( resolve ) => setTimeout( resolve, 50 ) );
		} );

		expect( secondPageScope.isDone() ).toBe( false );
	} );

	it( 'fetches additional follows pages when requested explicitly', async () => {
		const queryClient = makeQueryClient();
		const firstPage = Array.from( { length: 200 }, ( _value, index ) =>
			makeFollow( {
				ID: index + 1,
				feed_ID: index + 1,
				feed_URL: `https://example.com/feed-${ index + 1 }/`,
				URL: `https://example.com/feed-${ index + 1 }/`,
			} )
		);
		const firstPageScope = nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( ( query ) => query.page === '1' )
			.reply( 200, {
				subscriptions: firstPage.map( ( follow ) => ( {
					ID: follow.ID,
					URL: follow.URL,
					feed_URL: follow.feed_URL,
					feed_ID: follow.feed_ID,
				} ) ),
				total_subscriptions: 201,
				page: 1,
				number: 200,
			} );
		const secondPageScope = nock( BASE )
			.get( '/rest/v1.2/read/following/mine' )
			.query( ( query ) => query.page === '2' )
			.reply( 200, {
				subscriptions: [
					{
						ID: 201,
						URL: 'https://example.com/feed-201/',
						feed_URL: 'https://example.com/feed-201/',
						feed_ID: 201,
					},
				],
				total_subscriptions: 201,
				page: 2,
				number: 200,
			} );

		renderHook( () => useFollows( { fetchAllPages: true } ), {
			wrapper: makeWrapper( queryClient ),
		} );

		await waitFor( () => expect( firstPageScope.isDone() ).toBe( true ) );
		await waitFor( () => expect( secondPageScope.isDone() ).toBe( true ) );
	} );

	it( 'selector hooks react when a follow is patched into the query cache', async () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData( getFollowsQueryKey(), makeData() );

		const { result } = renderHook(
			() => ( {
				isFollowing: useIsFollowing( {
					feedUrl: 'https://example.com/rss',
					feedId: '456',
					blogId: '123',
				} ),
				blogFollow: useFollowForBlog( '123' ),
				feedFollow: useFollowForFeed( '456' ),
			} ),
			{ wrapper: makeWrapper( queryClient ) }
		);

		await waitFor( () => expect( result.current.isFollowing ).toBe( false ) );
		expect( result.current.blogFollow ).toBeUndefined();
		expect( result.current.feedFollow ).toBeUndefined();

		act( () => {
			patchFollow( queryClient, {
				requestedFeedUrl: 'https://example.com/rss',
				follow: makeFollow(),
			} );
		} );

		await waitFor( () => expect( result.current.isFollowing ).toBe( true ) );
		expect( result.current.blogFollow ).toMatchObject( { blog_ID: 123 } );
		expect( result.current.feedFollow ).toMatchObject( { feed_ID: 456 } );
	} );

	it( 'does not export hook or function names containing Reader', () => {
		expect( Object.keys( selectors ).filter( ( name ) => /Reader/.test( name ) ) ).toEqual( [] );
	} );
} );
