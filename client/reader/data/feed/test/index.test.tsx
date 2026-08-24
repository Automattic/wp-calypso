/*
 * @jest-environment jsdom
 */
import { ReadFeedSearchSort } from '@automattic/api-core';
import {
	readFeedQuery,
	readFeedSearchInfiniteQuery,
	readFeedSearchQuery,
} from '@automattic/api-queries';
import { QueryClient, QueryClientProvider, type InfiniteData } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	findCachedFeedByFeedUrl,
	getCachedFeed,
	normalizeFeed,
	patchFeedUnseenCounts,
	restoreFeedCache,
	useFeedQuery,
	useFeedSearchInfiniteQuery,
	useFeedSearchQuery,
} from '..';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const makeWrapper = ( client: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};

const newClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

describe( 'feed data layer', () => {
	afterEach( () => nock.cleanAll() );

	it( 'normalizes feed metadata like the legacy reducer', () => {
		expect(
			normalizeFeed( {
				feed_ID: '123',
				blog_ID: '456',
				name: 'ben &amp; jerries',
				URL: 'javascript:alert(1)',
				feed_URL: '',
				subscribe_URL: 'https://example.com/feed',
				description: '<p>peaches &amp; cream</p>',
				is_following: true,
				subscribers_count: 10,
				last_update: '2026-05-01T00:00:00+00:00',
				image: 'https://example.com/icon.png',
				organization_id: 42,
				unseen_count: 3,
				subscription_id: 99,
			} )
		).toMatchObject( {
			feed_ID: 123,
			blog_ID: 456,
			name: 'ben & jerries',
			URL: undefined,
			feed_URL: 'https://example.com/feed',
			description: 'peaches & cream',
			is_following: true,
			subscribers_count: 10,
			last_update: '2026-05-01T00:00:00+00:00',
			image: 'https://example.com/icon.png',
			organization_id: 42,
			unseen_count: 3,
			subscription_id: 99,
		} );
	} );

	it( 'returns normalized cached feeds by id and feed URL', async () => {
		nock( BASE ).get( '/rest/v1.1/read/feed/123' ).reply( 200, {
			feed_ID: '123',
			blog_ID: '456',
			name: 'Cached &amp; Feed',
			feed_URL: 'https://example.com/feed',
		} );
		const client = newClient();
		const { result } = renderHook( () => useFeedQuery( 123 ), { wrapper: makeWrapper( client ) } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( getCachedFeed( client, 123 ) ).toMatchObject( {
			feed_ID: 123,
			blog_ID: 456,
			name: 'Cached & Feed',
		} );
		expect( findCachedFeedByFeedUrl( client, 'https://example.com/feed' ) ).toMatchObject( {
			feed_ID: 123,
		} );
	} );

	it( 'seeds individual feed cache from simple search results', async () => {
		nock( BASE )
			.get( '/rest/v1.1/read/feed' )
			.query( { q: 'wordpress', sort: ReadFeedSearchSort.Relevance } )
			.reply( 200, {
				feeds: [ { feed_ID: '7', blog_ID: '8', name: 'Search &amp; Result' } ],
				total: 1,
			} );
		const client = newClient();
		const { result } = renderHook(
			() => useFeedSearchQuery( { query: 'wordpress', sort: ReadFeedSearchSort.Relevance } ),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data?.feeds[ 0 ] ).toMatchObject( {
			feed_ID: 7,
			blog_ID: 8,
			name: 'Search & Result',
		} );
		expect( getCachedFeed( client, 7 ) ).toMatchObject( {
			feed_ID: 7,
			name: 'Search & Result',
		} );
	} );

	it( 'seeds individual feed cache from paginated search results', async () => {
		nock( BASE )
			.get( '/rest/v1.1/read/feed' )
			.query( { q: 'wordpress', offset: '0' } )
			.reply( 200, {
				feeds: [ { feed_ID: '7', blog_ID: '8', name: 'First page' } ],
				total: 2,
				next_page: 'offset=10&algorithm=reader/manage/search:0',
			} );
		nock( BASE )
			.get( '/rest/v1.1/read/feed' )
			.query( { q: 'wordpress', offset: '10' } )
			.reply( 200, {
				feeds: [ { feed_ID: '9', blog_ID: '10', name: 'Second page' } ],
				total: 2,
			} );
		const client = newClient();
		const { result } = renderHook( () => useFeedSearchInfiniteQuery( { query: 'wordpress' } ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		await result.current.fetchNextPage();
		await waitFor( () => expect( result.current.hasNextPage ).toBe( false ) );

		expect( getCachedFeed( client, 7 ) ).toMatchObject( { feed_ID: 7, name: 'First page' } );
		expect( getCachedFeed( client, 9 ) ).toMatchObject( { feed_ID: 9, name: 'Second page' } );
	} );

	it( 'optimistically patches unseen counts in individual and search caches', () => {
		const client = newClient();
		const searchKey = readFeedSearchQuery( { query: 'wordpress' } ).queryKey;
		const infiniteKey = readFeedSearchInfiniteQuery( { query: 'wordpress' } ).queryKey;
		client.setQueryData( readFeedQuery( 7 ).queryKey, {
			feed_ID: 7,
			blog_ID: 8,
			feed_URL: 'https://example.com/feed',
			unseen_count: 3,
		} );
		client.setQueryData( searchKey, {
			feeds: [
				{
					feed_ID: 7,
					blog_ID: 8,
					feed_URL: 'https://example.com/feed',
					unseen_count: 3,
				},
			],
			total: 1,
		} );
		client.setQueryData< InfiniteData< unknown > >( infiniteKey, {
			pages: [
				{
					feeds: [
						{
							feed_ID: 7,
							blog_ID: 8,
							feed_URL: 'https://example.com/feed',
							unseen_count: 3,
						},
					],
					total: 1,
				},
			],
			pageParams: [ 0 ],
		} );

		const snapshot = patchFeedUnseenCounts( client, {
			feedIds: [ 7 ],
			feedUrls: [ 'https://example.com/feed' ],
			delta: -5,
		} );

		expect( getCachedFeed( client, 7 )?.unseen_count ).toBe( 0 );
		expect(
			client.getQueryData< { feeds: { unseen_count: number }[] } >( searchKey )?.feeds[ 0 ]
		).toMatchObject( { unseen_count: 0 } );
		expect(
			client.getQueryData< InfiniteData< { feeds: { unseen_count: number }[] } > >( infiniteKey )
				?.pages[ 0 ].feeds[ 0 ]
		).toMatchObject( { unseen_count: 0 } );

		restoreFeedCache( client, snapshot );

		expect( getCachedFeed( client, 7 )?.unseen_count ).toBe( 3 );
		expect(
			client.getQueryData< { feeds: { unseen_count: number }[] } >( searchKey )?.feeds[ 0 ]
		).toMatchObject( { unseen_count: 3 } );
		expect(
			client.getQueryData< InfiniteData< { feeds: { unseen_count: number }[] } > >( infiniteKey )
				?.pages[ 0 ].feeds[ 0 ]
		).toMatchObject( { unseen_count: 3 } );
	} );

	it( 'optimistically resets unseen counts by feed URL', () => {
		const client = newClient();
		client.setQueryData( readFeedQuery( 7 ).queryKey, {
			feed_ID: 7,
			blog_ID: 8,
			feed_URL: 'https://example.com/feed',
			unseen_count: 3,
		} );

		patchFeedUnseenCounts( client, {
			feedUrls: [ 'https://example.com/feed' ],
			reset: true,
		} );

		expect( getCachedFeed( client, 7 )?.unseen_count ).toBe( 0 );
	} );
} );
