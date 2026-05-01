import { readerMastodonKeys } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	useAuthorizeMastodonConnectionMutation,
	useCompleteMastodonConnectionMutation,
	useMastodonAuthorFeedInfiniteQuery,
	useMastodonAuthorProfileQuery,
	useMastodonConnectionQuery,
	useMastodonConnectionsQuery,
	useMastodonTagFeedInfiniteQuery,
	useMastodonTimelineInfiniteQuery,
} from '../reader-mastodon';

const BASE = 'https://public-api.wordpress.com';
function makeWrapper( c: QueryClient ) {
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ c }>{ children }</QueryClientProvider>;
	}
	return Wrapper;
}
function createWrapper() {
	const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	return makeWrapper( client );
}

describe( 'reader-mastodon hooks', () => {
	afterEach( () => nock.cleanAll() );

	it( 'useMastodonConnectionsQuery returns the list', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/mastodon/connections' ).reply( 200, { connections: [] } );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useMastodonConnectionsQuery(), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );

	it( 'useAuthorizeMastodonConnectionMutation returns authorize_url + state', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'authorize',
				instance: 'mastodon.social',
			} )
			.reply( 200, {
				authorize_url: 'https://mastodon.social/oauth/authorize?client_id=x&state=abc',
				state: 'abc',
			} );
		const client = new QueryClient();
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useAuthorizeMastodonConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		const response = await result.current.mutateAsync( { instance: 'mastodon.social' } );
		expect( response.state ).toBe( 'abc' );
		// authorize is a pure redirect-fetcher — there's nothing to invalidate
		// yet, so the mutation must not touch the cache.
		expect( spy ).not.toHaveBeenCalled();
	} );

	it( 'useCompleteMastodonConnectionMutation seeds the connections list cache synchronously', async () => {
		// Regression: without the synchronous `setQueryData` seed, the
		// `page.replace('/reader/mastodon/:id/timeline')` in the callback view
		// fires before `invalidateQueries` has refetched the list, so the
		// account view mounts against the stale list, fails to find the new id,
		// and the landing controller bounces the user back to connections[0].
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'complete',
				state: 'abc',
				code: 'xyz',
			} )
			.reply( 200, {
				connection: {
					id: 202,
					handle: '@new@mastodon.social',
					instance: 'mastodon.social',
					avatar: null,
				},
			} );
		const client = new QueryClient();
		client.setQueryData( readerMastodonKeys.connections(), {
			connections: [
				{
					id: 1,
					handle: '@old@mastodon.social',
					instance: 'mastodon.social',
					avatar: null,
				},
			],
		} );
		const { result } = renderHook( () => useCompleteMastodonConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync( { state: 'abc', code: 'xyz' } );

		const cached = client.getQueryData< { connections: Array< { id: number } > } >(
			readerMastodonKeys.connections()
		);
		expect( cached?.connections.map( ( c ) => c.id ) ).toEqual( [ 1, 202 ] );
	} );

	it( 'useCompleteMastodonConnectionMutation does not duplicate an already-cached connection', async () => {
		// A refetch landing between complete and onSuccess could leave the new
		// connection already in the cache. Re-seeding it must not produce a
		// duplicate — the sidebar renders one row per id.
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'complete',
				state: 'abc',
				code: 'xyz',
			} )
			.reply( 200, {
				connection: {
					id: 303,
					handle: '@dup@mastodon.social',
					instance: 'mastodon.social',
					avatar: null,
				},
			} );
		const client = new QueryClient();
		client.setQueryData( readerMastodonKeys.connections(), {
			connections: [
				{
					id: 303,
					handle: '@dup@mastodon.social',
					instance: 'mastodon.social',
					avatar: null,
				},
			],
		} );
		const { result } = renderHook( () => useCompleteMastodonConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync( { state: 'abc', code: 'xyz' } );

		const cached = client.getQueryData< { connections: Array< { id: number } > } >(
			readerMastodonKeys.connections()
		);
		expect( cached?.connections.map( ( c ) => c.id ) ).toEqual( [ 303 ] );
	} );

	it( 'useCompleteMastodonConnectionMutation invalidates the connections query', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/mastodon/connections', {
				step: 'complete',
				state: 'abc',
				code: 'xyz',
			} )
			.reply( 200, {
				connection: {
					id: 101,
					handle: '@alice@mastodon.social',
					instance: 'mastodon.social',
					avatar: null,
				},
			} );
		const client = new QueryClient();
		client.setQueryData( readerMastodonKeys.connections(), 'old' );
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useCompleteMastodonConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync( { state: 'abc', code: 'xyz' } );
		await waitFor( () =>
			expect( spy ).toHaveBeenCalledWith( { queryKey: readerMastodonKeys.connections() } )
		);
	} );

	it( 'useMastodonConnectionQuery is disabled when id is null', () => {
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useMastodonConnectionQuery( null ), {
			wrapper: makeWrapper( client ),
		} );
		expect( result.current.fetchStatus ).toBe( 'idle' );
	} );

	it( 'useMastodonConnectionQuery fetches /connections/:id', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42' )
			.reply( 200, {
				handle: '@alice@mastodon.social',
				instance: 'mastodon.social',
				display_name: 'Alice',
				description: '',
				avatar: 'https://cdn/avatar.png',
				header: null,
				counts: { followers: 0, following: 0, posts: 0 },
				raw: {},
			} );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useMastodonConnectionQuery( 42 ), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.avatar ).toBe( 'https://cdn/avatar.png' );
	} );
} );

describe( 'useMastodonTimelineInfiniteQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches first page with no cursor', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/9/timeline' )
			.reply( 200, { items: [], cursor: 'next-cursor' } );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useMastodonTimelineInfiniteQuery( 9 ), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.pages[ 0 ].cursor ).toBe( 'next-cursor' );
	} );
} );

describe( 'useMastodonAuthorProfileQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches /profile/:actor and returns the profile', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020' )
			.reply( 200, {
				id: '108020',
				acct: 'alice@mastodon.social',
				display_name: 'Alice',
				avatar: null,
				header: null,
				note: '',
				counts: { followers: 0, following: 0, posts: 0 },
				locked: false,
				raw: {},
			} );
		const { result } = renderHook( () => useMastodonAuthorProfileQuery( 7, '108020' ), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => expect( result.current.data?.acct ).toBe( 'alice@mastodon.social' ) );
	} );

	it( 'is disabled when actor is empty', () => {
		const { result } = renderHook( () => useMastodonAuthorProfileQuery( 7, '' ), {
			wrapper: createWrapper(),
		} );
		expect( result.current.fetchStatus ).toBe( 'idle' );
	} );
} );

describe( 'useMastodonAuthorFeedInfiniteQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches first page with no cursor', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.reply( 200, { items: [], cursor: null } );
		const { result } = renderHook( () => useMastodonAuthorFeedInfiniteQuery( 7, '108020' ), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => expect( result.current.data?.pages[ 0 ].cursor ).toBeNull() );
	} );

	it( 'getNextPageParam treats empty-string cursor as done', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.reply( 200, { items: [], cursor: '' } );
		const { result } = renderHook( () => useMastodonAuthorFeedInfiniteQuery( 7, '108020' ), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => expect( result.current.hasNextPage ).toBe( false ) );
	} );
} );

describe( 'useMastodonAuthorFeedInfiniteQuery filter', () => {
	afterEach( () => nock.cleanAll() );

	it( 'forwards posts_no_replies as exclude_replies=true', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.query( { exclude_replies: 'true' } )
			.reply( 200, { items: [], cursor: null } );
		const { result } = renderHook(
			() => useMastodonAuthorFeedInfiniteQuery( 7, '108020', 'posts_no_replies' ),
			{ wrapper: createWrapper() }
		);
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );

	it( 'collapses posts_with_replies (default) to no-filter cache key', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/profile/108020/feed' )
			.reply( 200, { items: [], cursor: null } );
		const { result } = renderHook(
			() => useMastodonAuthorFeedInfiniteQuery( 7, '108020', 'posts_with_replies' ),
			{ wrapper: createWrapper() }
		);
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );
} );

describe( 'useMastodonTagFeedInfiniteQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'fetches the first page of a tag feed', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, { items: [], cursor: null } );
		const { result } = renderHook( () => useMastodonTagFeedInfiniteQuery( 7, 'rust' ), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );

	it( 'forwards filter=media as only_media=true', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.query( { only_media: 'true' } )
			.reply( 200, { items: [], cursor: null } );
		const { result } = renderHook( () => useMastodonTagFeedInfiniteQuery( 7, 'rust', 'media' ), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );

	it( 'collapses filter=all to no-filter cache key', async () => {
		// Same nock that the no-filter case would hit — keys must merge.
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/7/tag/rust/feed' )
			.reply( 200, { items: [], cursor: null } );
		const { result } = renderHook( () => useMastodonTagFeedInfiniteQuery( 7, 'rust', 'all' ), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );
} );
