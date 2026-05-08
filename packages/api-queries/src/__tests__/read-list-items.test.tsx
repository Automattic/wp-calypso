import { QueryClient, QueryClientProvider, useMutation, useQuery } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	addReadListFeedMutation,
	addReadListTagMutation,
	deleteReadListFeedMutation,
	deleteReadListSiteMutation,
	deleteReadListTagMutation,
	readListItemsAllQuery,
	readListItemsInfiniteQuery,
	readListItemsQuery,
} from '../read-list-items';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper( client: QueryClient ) {
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ client }>{ children }</QueryClientProvider>;
	};
}

function newClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

describe( 'readListItemsAllQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches all items for a list with the legacy query args', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/lists/alice/my-list/items' )
			.query( { meta: 'site,feed,tag', page: 1, number: 2000 } )
			.reply( 200, {
				list_ID: 42,
				success: true,
				items: [ { ID: '1', feed_ID: 7 } ],
				page: 1,
				number: 2000,
				total_items: 1,
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readListItemsAllQuery( 'alice', 'my-list' ) ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
		expect( result.current.data?.list_ID ).toBe( 42 );
		expect( result.current.data?.items ).toHaveLength( 1 );
	} );

	it( 'works for the recommended-blogs slug', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/lists/alice/recommended-blogs/items' )
			.query( { meta: 'site,feed,tag', page: 1, number: 2000 } )
			.reply( 200, {
				list_ID: 99,
				success: true,
				items: [],
				page: 1,
				number: 2000,
				total_items: 0,
			} );

		const client = newClient();
		const { result } = renderHook(
			() => useQuery( readListItemsAllQuery( 'alice', 'recommended-blogs' ) ),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
		expect( result.current.data?.list_ID ).toBe( 99 );
	} );

	it( 'is disabled when owner or slug is missing', () => {
		const client = newClient();
		const { result } = renderHook( () => useQuery( readListItemsAllQuery( null, 'my-list' ) ), {
			wrapper: makeWrapper( client ),
		} );

		expect( result.current.fetchStatus ).toBe( 'idle' );
		expect( result.current.data ).toBeUndefined();
	} );

	it( 'URL-encodes owner and slug', async () => {
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/lists/al%20ice/my%2Flist/items' )
			.query( { meta: 'site,feed,tag', page: 1, number: 2000 } )
			.reply( 200, {
				list_ID: 1,
				success: true,
				items: [],
				page: 1,
				number: 2000,
				total_items: 0,
			} );

		const client = newClient();
		const { result } = renderHook( () => useQuery( readListItemsAllQuery( 'al ice', 'my/list' ) ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'does not retry when the API returns list_not_found', async () => {
		// Single interceptor — if the query retries, the second request 404s
		// with a different error and the test fails.
		const scope = nock( BASE )
			.get( '/rest/v1.2/read/lists/alice/recommended-blogs/items' )
			.query( true )
			.reply( 404, { error: 'list_not_found' } );

		// Use a client that allows retries (default 3) so the retry logic in the
		// query factory itself is what stops the second attempt.
		const client = new QueryClient();
		const { result } = renderHook(
			() => useQuery( readListItemsAllQuery( 'alice', 'recommended-blogs' ) ),
			{ wrapper: makeWrapper( client ) }
		);

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( scope.isDone() ).toBe( true );
		expect( nock.pendingMocks() ).toHaveLength( 0 );
	} );
} );

function seedItems( client: QueryClient, owner: string, slug: string, items: unknown[] ) {
	client.setQueryData( readListItemsAllQuery( owner, slug ).queryKey, {
		list_ID: 42,
		success: true,
		items,
		page: 1,
		number: 2000,
		total_items: items.length,
	} );
}

describe( 'addReadListFeedMutation', () => {
	afterEach( () => nock.cleanAll() );

	it( 'optimistically appends a feed and confirms it on success', async () => {
		nock( BASE )
			.post( '/rest/v1.2/read/lists/alice/my-list/feeds/new', { feed_id: 7 } )
			.reply( 200, { feed_id: 7 } );

		const client = newClient();
		seedItems( client, 'alice', 'my-list', [ { feed_ID: 1 } ] );

		const { result } = renderHook( () => useMutation( addReadListFeedMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await result.current.mutateAsync( { owner: 'alice', slug: 'my-list', feedId: 7 } );

		const items = client.getQueryData< { items: { feed_ID: number }[] } >(
			readListItemsAllQuery( 'alice', 'my-list' ).queryKey
		)?.items;
		expect( items ).toEqual( expect.arrayContaining( [ { feed_ID: 1 }, { feed_ID: 7 } ] ) );
	} );

	it( 'rolls back the optimistic update on error', async () => {
		nock( BASE )
			.post( '/rest/v1.2/read/lists/alice/my-list/feeds/new' )
			.reply( 500, { error: 'oops' } );

		const client = newClient();
		seedItems( client, 'alice', 'my-list', [ { feed_ID: 1 } ] );

		const { result } = renderHook( () => useMutation( addReadListFeedMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await expect(
			result.current.mutateAsync( { owner: 'alice', slug: 'my-list', feedId: 7 } )
		).rejects.toBeDefined();

		const items = client.getQueryData< { items: { feed_ID: number }[] } >(
			readListItemsAllQuery( 'alice', 'my-list' ).queryKey
		)?.items;
		expect( items ).toEqual( [ { feed_ID: 1 } ] );
	} );

	it( 'invalidates the paginated and infinite items queries on settle', async () => {
		nock( BASE )
			.post( '/rest/v1.2/read/lists/alice/my-list/feeds/new' )
			.reply( 200, { feed_id: 7 } );

		const client = newClient();
		// Seed both the paginated and infinite caches as if they had been
		// previously fetched alongside the `'all'` cache.
		client.setQueryData( readListItemsQuery( 'alice', 'my-list' ).queryKey, {
			list_ID: 1,
			success: true,
			items: [],
			page: 1,
			number: 20,
			total_items: 0,
		} );
		client.setQueryData( readListItemsInfiniteQuery( 'alice', 'my-list', 'feed,site' ).queryKey, {
			pages: [ { list_ID: 1, success: true, items: [], page: 1, number: 20, total_items: 0 } ],
			pageParams: [ 1 ],
		} );

		const { result } = renderHook( () => useMutation( addReadListFeedMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await result.current.mutateAsync( { owner: 'alice', slug: 'my-list', feedId: 7 } );

		expect(
			client.getQueryState( readListItemsQuery( 'alice', 'my-list' ).queryKey )?.isInvalidated
		).toBe( true );
		expect(
			client.getQueryState( readListItemsInfiniteQuery( 'alice', 'my-list', 'feed,site' ).queryKey )
				?.isInvalidated
		).toBe( true );
	} );
} );

describe( 'deleteReadListFeedMutation', () => {
	afterEach( () => nock.cleanAll() );

	it( 'optimistically removes a feed', async () => {
		nock( BASE ).post( '/rest/v1.2/read/lists/alice/my-list/feeds/7/delete' ).reply( 200, {} );

		const client = newClient();
		seedItems( client, 'alice', 'my-list', [ { feed_ID: 1 }, { feed_ID: 7 } ] );

		const { result } = renderHook( () => useMutation( deleteReadListFeedMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await result.current.mutateAsync( { owner: 'alice', slug: 'my-list', feedId: 7 } );

		const items = client.getQueryData< { items: { feed_ID: number }[] } >(
			readListItemsAllQuery( 'alice', 'my-list' ).queryKey
		)?.items;
		expect( items?.find( ( item ) => item.feed_ID === 7 ) ).toBeUndefined();
	} );
} );

describe( 'deleteReadListSiteMutation', () => {
	afterEach( () => nock.cleanAll() );

	it( 'optimistically removes a site', async () => {
		nock( BASE ).post( '/rest/v1.2/read/lists/alice/my-list/sites/9/delete' ).reply( 200, {} );

		const client = newClient();
		seedItems( client, 'alice', 'my-list', [ { site_ID: 9 }, { site_ID: 10 } ] );

		const { result } = renderHook( () => useMutation( deleteReadListSiteMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await result.current.mutateAsync( { owner: 'alice', slug: 'my-list', siteId: 9 } );

		const items = client.getQueryData< { items: { site_ID: number }[] } >(
			readListItemsAllQuery( 'alice', 'my-list' ).queryKey
		)?.items;
		expect( items?.find( ( item ) => item.site_ID === 9 ) ).toBeUndefined();
	} );
} );

describe( 'addReadListTagMutation', () => {
	afterEach( () => nock.cleanAll() );

	it( 'posts the tag and invalidates on settle', async () => {
		const scope = nock( BASE )
			.post( '/rest/v1.2/read/lists/alice/my-list/tags/new', { tag: 'photography' } )
			.reply( 200, { tagId: 99 } );

		const client = newClient();
		const { result } = renderHook( () => useMutation( addReadListTagMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await result.current.mutateAsync( {
			owner: 'alice',
			slug: 'my-list',
			tagSlug: 'photography',
		} );
		expect( scope.isDone() ).toBe( true );
	} );

	it( 'optimistically appends a tag placeholder when tagId is supplied', async () => {
		nock( BASE )
			.post( '/rest/v1.2/read/lists/alice/my-list/tags/new', { tag: 'photography' } )
			.reply( 200, { tagId: 99 } );

		const client = newClient();
		seedItems( client, 'alice', 'my-list', [ { tag_ID: 5 } ] );

		const { result } = renderHook( () => useMutation( addReadListTagMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await result.current.mutateAsync( {
			owner: 'alice',
			slug: 'my-list',
			tagSlug: 'photography',
			tagId: 99,
		} );

		const items = client.getQueryData< { items: { tag_ID?: number }[] } >(
			readListItemsAllQuery( 'alice', 'my-list' ).queryKey
		)?.items;
		expect( items?.find( ( item ) => item.tag_ID === 99 ) ).toBeDefined();
	} );

	it( 'rolls back the optimistic tag placeholder on error', async () => {
		nock( BASE )
			.post( '/rest/v1.2/read/lists/alice/my-list/tags/new' )
			.reply( 500, { error: 'oops' } );

		const client = newClient();
		seedItems( client, 'alice', 'my-list', [ { tag_ID: 5 } ] );

		const { result } = renderHook( () => useMutation( addReadListTagMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await expect(
			result.current.mutateAsync( {
				owner: 'alice',
				slug: 'my-list',
				tagSlug: 'photography',
				tagId: 99,
			} )
		).rejects.toBeDefined();

		const items = client.getQueryData< { items: { tag_ID?: number }[] } >(
			readListItemsAllQuery( 'alice', 'my-list' ).queryKey
		)?.items;
		expect( items ).toEqual( [ { tag_ID: 5 } ] );
	} );
} );

describe( 'deleteReadListTagMutation', () => {
	afterEach( () => nock.cleanAll() );

	it( 'optimistically removes a tag by ID', async () => {
		nock( BASE )
			.post( '/rest/v1.2/read/lists/alice/my-list/tags/photography/delete' )
			.reply( 200, {} );

		const client = newClient();
		seedItems( client, 'alice', 'my-list', [ { tag_ID: 5 }, { tag_ID: 6 } ] );

		const { result } = renderHook( () => useMutation( deleteReadListTagMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await result.current.mutateAsync( {
			owner: 'alice',
			slug: 'my-list',
			tagId: 5,
			tagSlug: 'photography',
		} );

		const items = client.getQueryData< { items: { tag_ID: number }[] } >(
			readListItemsAllQuery( 'alice', 'my-list' ).queryKey
		)?.items;
		expect( items?.find( ( item ) => item.tag_ID === 5 ) ).toBeUndefined();
	} );
} );
