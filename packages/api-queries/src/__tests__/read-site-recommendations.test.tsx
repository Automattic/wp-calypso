import {
	QueryClient,
	QueryClientProvider,
	useInfiniteQuery,
	useMutation,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	dismissReadSiteRecommendationMutation,
	getReadSiteRecommendationsInfiniteQueryKeyPrefix,
	getReadSiteRecommendationsInfiniteQueryKeyRoot,
	readSiteRecommendationsInfiniteQuery,
} from '../read-site-recommendations';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper( client: QueryClient ) {
	return function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

function newClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'readSiteRecommendationsInfiniteQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'uses seed and number in the stable infinite query key', () => {
		const client = newClient();

		renderHook(
			() =>
				useInfiniteQuery(
					readSiteRecommendationsInfiniteQuery( { seed: 42, number: 4, enabled: false } )
				),
			{ wrapper: makeWrapper( client ) }
		);

		expect( client.getQueryCache().getAll() ).toHaveLength( 1 );
		expect( client.getQueryCache().getAll()[ 0 ].queryKey ).toEqual( [
			'read',
			'site-recommendations',
			'infinite',
			42,
			4,
		] );
	} );

	it( 'uses the same stable infinite query key prefix for seed-scoped cache updates', () => {
		const client = newClient();

		renderHook(
			() => {
				useInfiniteQuery(
					readSiteRecommendationsInfiniteQuery( { seed: 42, number: 4, enabled: false } )
				);
				useInfiniteQuery(
					readSiteRecommendationsInfiniteQuery( { seed: 42, number: 8, enabled: false } )
				);
			},
			{ wrapper: makeWrapper( client ) }
		);

		const matchingQueryKeys = client
			.getQueriesData( {
				queryKey: getReadSiteRecommendationsInfiniteQueryKeyPrefix( { seed: 42 } ),
			} )
			.map( ( [ queryKey ] ) => queryKey );

		expect( matchingQueryKeys ).toHaveLength( 2 );
		expect( matchingQueryKeys ).toEqual(
			expect.arrayContaining( [
				[ 'read', 'site-recommendations', 'infinite', 42, 4 ],
				[ 'read', 'site-recommendations', 'infinite', 42, 8 ],
			] )
		);
	} );

	it( 'uses the same stable infinite query key root for global cache updates', () => {
		const client = newClient();

		renderHook(
			() => {
				useInfiniteQuery(
					readSiteRecommendationsInfiniteQuery( { seed: 42, number: 4, enabled: false } )
				);
				useInfiniteQuery(
					readSiteRecommendationsInfiniteQuery( { seed: 84, number: 4, enabled: false } )
				);
			},
			{ wrapper: makeWrapper( client ) }
		);

		const matchingQueryKeys = client
			.getQueriesData( {
				queryKey: getReadSiteRecommendationsInfiniteQueryKeyRoot(),
			} )
			.map( ( [ queryKey ] ) => queryKey );

		expect( matchingQueryKeys ).toHaveLength( 2 );
		expect( matchingQueryKeys ).toEqual(
			expect.arrayContaining( [
				[ 'read', 'site-recommendations', 'infinite', 42, 4 ],
				[ 'read', 'site-recommendations', 'infinite', 84, 4 ],
			] )
		);
	} );

	it( 'sets explicit staleTime and disables persistence', () => {
		const client = newClient();

		renderHook(
			() =>
				useInfiniteQuery(
					readSiteRecommendationsInfiniteQuery( { seed: 42, number: 4, enabled: false } )
				),
			{ wrapper: makeWrapper( client ) }
		);

		const query = client.getQueryCache().getAll()[ 0 ];

		expect( query.options.staleTime ).toBe( 5 * 60 * 1000 );
		expect( query.options.meta ).toEqual( { persist: false } );
	} );

	it( 'fetches page offsets through pageParam and stops after an empty page', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( {
				number: '2',
				offset: '0',
				seed: '42',
				posts_per_site: '0',
			} )
			.reply( 200, {
				algorithm: 'algo',
				sites: [
					{
						blog_id: 1,
						description: 'One',
						feed_id: 10,
						feed_url: 'https://one.test/feed',
						ID: 1,
						name: 'One',
						railcar: {},
						URL: 'https://one.test',
					},
				],
			} );

		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( {
				number: '2',
				offset: '2',
				seed: '42',
				posts_per_site: '0',
			} )
			.reply( 200, { algorithm: 'algo', sites: [] } );

		const client = newClient();
		const { result } = renderHook(
			() => useInfiniteQuery( readSiteRecommendationsInfiniteQuery( { seed: 42, number: 2 } ) ),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.hasNextPage ).toBe( true );

		await act( async () => {
			await result.current.fetchNextPage();
		} );

		await waitFor( () => expect( result.current.hasNextPage ).toBe( false ) );
		expect( result.current.data?.pageParams ).toEqual( [ 0, 2 ] );
		expect( nock.isDone() ).toBe( true );
	} );

	it( 'uses meta.next_page as the next page offset when provided', async () => {
		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( {
				number: '2',
				offset: '0',
				seed: '42',
				posts_per_site: '0',
			} )
			.reply( 200, {
				algorithm: 'algo',
				meta: { next_page: '8' },
				sites: [
					{
						blog_id: 1,
						description: 'One',
						feed_id: 10,
						feed_url: 'https://one.test/feed',
						ID: 1,
						name: 'One',
						railcar: {},
						URL: 'https://one.test',
					},
				],
			} );

		nock( BASE )
			.get( '/rest/v1.2/read/recommendations/sites' )
			.query( {
				number: '2',
				offset: '8',
				seed: '42',
				posts_per_site: '0',
			} )
			.reply( 200, { algorithm: 'algo', sites: [] } );

		const client = newClient();
		const { result } = renderHook(
			() => useInfiniteQuery( readSiteRecommendationsInfiniteQuery( { seed: 42, number: 2 } ) ),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.hasNextPage ).toBe( true );

		await act( async () => {
			await result.current.fetchNextPage();
		} );

		await waitFor( () => expect( result.current.data?.pageParams ).toEqual( [ 0, 8 ] ) );
		expect( nock.isDone() ).toBe( true );
	} );
} );

describe( 'dismissReadSiteRecommendationMutation', () => {
	afterEach( () => nock.cleanAll() );

	it( 'uses the read site recommendation dismiss mutator', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.1/me/dismiss/sites/123/new' )
			.reply( 200, { success: true } );
		const client = newClient();
		const { result } = renderHook( () => useMutation( dismissReadSiteRecommendationMutation() ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await expect( result.current.mutateAsync( { siteId: 123 } ) ).resolves.toEqual( {
				success: true,
			} );
		} );

		expect( result.current.isSuccess ).toBe( true );
		expect( scope.isDone() ).toBe( true );
	} );
} );
