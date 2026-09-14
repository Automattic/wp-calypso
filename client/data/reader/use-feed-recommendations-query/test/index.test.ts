/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { createElement, type ReactNode } from 'react';
import { useFeedRecommendationsQuery } from '..';

const BASE = 'https://public-api.wordpress.com';

function newClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function makeWrapper( client: QueryClient ) {
	return ( { children }: { children: ReactNode } ) =>
		createElement( QueryClientProvider, { client }, children );
}

function stubItems( body: object ) {
	return nock( BASE )
		.get( '/rest/v1.2/read/lists/test/recommended-blogs/items' )
		.query( true )
		.reply( 200, body );
}

describe( 'useFeedRecommendationsQuery', () => {
	beforeAll( () => nock.disableNetConnect() );
	afterEach( () => nock.cleanAll() );

	it( 'returns an empty array while loading', () => {
		stubItems( { list_ID: 1, items: [], success: true, page: 1, number: 2000, total_items: 0 } );

		const { result } = renderHook( () => useFeedRecommendationsQuery( 'test' ), {
			wrapper: makeWrapper( newClient() ),
		} );

		expect( result.current.data ).toEqual( [] );
		expect( result.current.isLoading ).toBe( true );
	} );

	it( 'normalizes site-shaped items', async () => {
		stubItems( {
			list_ID: 1,
			items: [
				{
					feed_ID: '7',
					meta: {
						data: {
							site: {
								ID: '99',
								name: 'Test Blog',
								feed_URL: 'https://example.com/feed',
								description: '',
								icon: { img: 'https://example.com/icon.png' },
							},
						},
					},
				},
			],
			success: true,
			page: 1,
			number: 2000,
			total_items: 1,
		} );

		const { result } = renderHook( () => useFeedRecommendationsQuery( 'test' ), {
			wrapper: makeWrapper( newClient() ),
		} );

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );
		expect( result.current.data ).toEqual( [
			{
				ID: '99',
				image: 'https://example.com/icon.png',
				name: 'Test Blog',
				feedUrl: 'https://example.com/feed',
				siteId: '99',
				feedId: '7',
			},
		] );
	} );

	it( 'falls back to feed-shaped items', async () => {
		stubItems( {
			list_ID: 1,
			items: [
				{
					feed_ID: '8',
					meta: {
						data: {
							feed: {
								blog_ID: '12',
								name: 'Feed Blog',
								feed_URL: 'https://feed.example.com',
								image: 'https://feed.example.com/image.png',
							},
						},
					},
				},
			],
			success: true,
			page: 1,
			number: 2000,
			total_items: 1,
		} );

		const { result } = renderHook( () => useFeedRecommendationsQuery( 'test' ), {
			wrapper: makeWrapper( newClient() ),
		} );

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );
		expect( result.current.data ).toEqual( [
			{
				ID: '12',
				image: 'https://feed.example.com/image.png',
				name: 'Feed Blog',
				feedUrl: 'https://feed.example.com',
				siteId: '12',
				feedId: '8',
			},
		] );
	} );

	it( 'is disabled when no userLogin is provided', () => {
		const { result } = renderHook( () => useFeedRecommendationsQuery( '' ), {
			wrapper: makeWrapper( newClient() ),
		} );

		expect( result.current.data ).toEqual( [] );
		expect( result.current.isLoading ).toBe( false );
	} );

	it( 'is disabled when explicitly disabled via options', () => {
		const { result } = renderHook(
			() => useFeedRecommendationsQuery( 'test', { enabled: false } ),
			{ wrapper: makeWrapper( newClient() ) }
		);

		expect( result.current.data ).toEqual( [] );
		expect( result.current.isLoading ).toBe( false );
	} );

	it( 'does not retry on error (matches legacy noRetry)', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/lists/test/recommended-blogs/items' )
			.query( true )
			.reply( 404, { error: 'list_not_found' } );

		const { result } = renderHook( () => useFeedRecommendationsQuery( 'test' ), {
			wrapper: makeWrapper( newClient() ),
		} );

		await waitFor( () => expect( result.current.isLoading ).toBe( false ) );
		expect( scope.isDone() ).toBe( true );
		expect( result.current.data ).toEqual( [] );
	} );
} );
