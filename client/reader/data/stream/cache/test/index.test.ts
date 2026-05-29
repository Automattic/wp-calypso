import { QueryClient, type InfiniteData } from '@tanstack/react-query';
import {
	getCachedStreamItems,
	getStreamInfiniteQueryKey,
	removeStreamItemFromCache,
} from 'calypso/reader/data/stream';
import type { ReadStreamPost, ReadStreamResponse } from '@automattic/api-core';
import type { PageHandle } from '@automattic/api-queries';

const makeQueryClient = () => new QueryClient( { defaultOptions: { queries: { retry: false } } } );

const apiPost = ( id: number, overrides: Partial< ReadStreamPost > = {} ): ReadStreamPost => ( {
	ID: id,
	site_ID: 100,
	global_ID: `global-${ id }`,
	URL: `https://example.com/post-${ id }`,
	date: `2026-04-${ String( id ).padStart( 2, '0' ) }T00:00:00Z`,
	...overrides,
} );

const infiniteStreamData = (
	pages: ReadStreamResponse[]
): InfiniteData< ReadStreamResponse, PageHandle > => ( {
	pages,
	pageParams: [ null ],
} );

const streamQueryKey = ( localeSlug: string | null = null ) =>
	getStreamInfiniteQueryKey( {
		streamKey: 'following',
		feedId: null,
		localeSlug,
		startDate: null,
	} );

describe( 'reader/data/stream cache helpers', () => {
	it( 'returns cached stream items for the matching stream identity', () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			streamQueryKey( 'pt-br' ),
			infiniteStreamData( [ { posts: [ apiPost( 1 ) ] } ] )
		);
		queryClient.setQueryData(
			streamQueryKey( 'es' ),
			infiniteStreamData( [ { posts: [ apiPost( 2 ) ] } ] )
		);

		const items = getCachedStreamItems( queryClient, {
			streamKey: 'following',
			localeSlug: 'es',
		} );

		expect( items ).toHaveLength( 1 );
		expect( items[ 0 ] ).toMatchObject( { blogId: 100, postId: 2 } );
	} );

	it( 'removes a post from every matching infinite stream cache entry', () => {
		const queryClient = makeQueryClient();
		queryClient.setQueryData(
			streamQueryKey(),
			infiniteStreamData( [ { posts: [ apiPost( 1 ), apiPost( 2 ) ] } ] )
		);

		removeStreamItemFromCache( queryClient, {
			streamKey: 'following',
			item: { blogId: 100, postId: 1 },
		} );

		const items = getCachedStreamItems( queryClient, { streamKey: 'following' } );
		expect( items ).toHaveLength( 1 );
		expect( items[ 0 ] ).toMatchObject( { blogId: 100, postId: 2 } );
	} );

	it( 'removes post cards without dropping non-post cards from discover streams', () => {
		const queryClient = makeQueryClient();
		const queryKey = getStreamInfiniteQueryKey( {
			streamKey: 'discover:recommended',
			feedId: null,
			localeSlug: null,
			startDate: null,
		} );
		queryClient.setQueryData(
			queryKey,
			infiniteStreamData( [
				{
					cards: [
						{ type: 'post', data: apiPost( 1 ) },
						{ type: 'recommended_blogs', data: [ { feed_ID: 10, URL: 'https://example.com' } ] },
						{ type: 'post', data: apiPost( 2 ) },
					],
				},
			] )
		);

		removeStreamItemFromCache( queryClient, {
			streamKey: 'discover:recommended',
			item: { blogId: 100, postId: 1 },
		} );

		const cachedData =
			queryClient.getQueryData< InfiniteData< ReadStreamResponse, PageHandle > >( queryKey );
		expect( cachedData?.pages[ 0 ].cards ).toEqual( [
			{ type: 'recommended_blogs', data: [ { feed_ID: 10, URL: 'https://example.com' } ] },
			{ type: 'post', data: expect.objectContaining( { ID: 2 } ) },
		] );
	} );
} );
