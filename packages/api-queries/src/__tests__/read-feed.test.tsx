import {
	QueryClient,
	QueryClientProvider,
	useInfiniteQuery,
	useQuery,
} from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	readFeedQuery,
	readFeedQueryKey,
	readFeedSearchInfiniteQuery,
	readFeedSearchInfiniteQueryKey,
	readFeedSearchQuery,
	readFeedSearchQueryKey,
} from '../read-feed';
import type { ReactNode } from 'react';

const BASE = 'https://public-api.wordpress.com';

const makeWrapper = ( client: QueryClient ) =>
	function Wrapper( { children }: { children: ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};

const newClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

describe( 'read feed queries', () => {
	afterEach( () => nock.cleanAll() );

	it( 'uses stable feed metadata query options', () => {
		const options = readFeedQuery( 123 );

		expect( readFeedQueryKey( 123 ) ).toEqual( [ 'read', 'feed', 123 ] );
		expect( options.queryKey ).toEqual( readFeedQueryKey( 123 ) );
		expect( options.enabled ).toBe( true );
		expect( options.staleTime ).toBe( 60 * 1000 );
		expect( options.meta ).toEqual( { persist: true } );
	} );

	it( 'disables feed metadata queries for invalid feed ids', () => {
		expect( readFeedQuery( null ).enabled ).toBe( false );
		expect( readFeedQuery( undefined ).enabled ).toBe( false );
		expect( readFeedQuery( 'abc' ).enabled ).toBe( false );
		expect( readFeedQuery( -1 ).enabled ).toBe( false );
	} );

	it( 'uses memory-only search query options', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.1/read/feed' )
			.query( { q: 'wordpress', exclude_followed: 'false', sort: 'relevance' } )
			.reply( 200, { feeds: [ { feed_ID: '1', blog_ID: '2', name: 'WordPress' } ], total: 1 } );
		const client = newClient();
		const { result } = renderHook(
			() =>
				useQuery(
					readFeedSearchQuery( {
						query: 'wordpress',
						excludeFollowed: false,
						sort: 'relevance' as never,
					} )
				),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( scope.isDone() ).toBe( true );
		expect(
			readFeedSearchQueryKey( {
				query: 'wordpress',
				excludeFollowed: false,
				sort: 'relevance' as never,
			} )
		).toEqual( [ 'read', 'feeds', 'search', 'wordpress', false, 'relevance' ] );
		expect(
			readFeedSearchQuery( {
				query: 'wordpress',
				excludeFollowed: false,
				sort: 'relevance' as never,
			} ).meta
		).toEqual( { persist: false } );
	} );

	it( 'uses an infinite query only for paginated feed search', async () => {
		nock( BASE )
			.get( '/rest/v1.1/read/feed' )
			.query( { q: 'wordpress', offset: '0' } )
			.reply( 200, { feeds: [ { feed_ID: '1' }, { feed_ID: '2' } ], total: 3 } );
		nock( BASE )
			.get( '/rest/v1.1/read/feed' )
			.query( { q: 'wordpress', offset: '2' } )
			.reply( 200, { feeds: [ { feed_ID: '3' } ], total: 3 } );
		const client = newClient();
		const { result } = renderHook(
			() => useInfiniteQuery( readFeedSearchInfiniteQuery( { query: 'wordpress' } ) ),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.hasNextPage ).toBe( true );

		await result.current.fetchNextPage();
		await waitFor( () => expect( result.current.hasNextPage ).toBe( false ) );

		expect( readFeedSearchInfiniteQueryKey( { query: 'wordpress' } ) ).toEqual( [
			'read',
			'feeds',
			'search',
			'infinite',
			'wordpress',
			undefined,
			undefined,
		] );
		expect( result.current.data?.pages.flatMap( ( page ) => page.feeds ) ).toHaveLength( 3 );
	} );
} );
