// `logToLogstash` fires a real HTTPS request to the wpcom logstash
// endpoint. Mute it so the optimistic-mutation onError tests don't
// trigger an unmocked nock request.
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

import {
	readerMastodonKeys,
	type MastodonAuthorProfile,
	type MastodonFeedItem,
	type MastodonThreadResponse,
	type MastodonTimelinePage,
} from '@automattic/api-core';
import {
	QueryClient,
	QueryClientProvider,
	useMutation,
	type InfiniteData,
} from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	createMastodonPostMutation,
	followMastodonActorMutation,
	mastodonActorFollowersInfiniteQuery,
	mastodonActorFollowingInfiniteQuery,
	mastodonAuthStatusQueryOptions,
	unfollowMastodonActorMutation,
	uploadMastodonMediaMutation,
	useAuthorizeMastodonConnectionMutation,
	useCompleteMastodonConnectionMutation,
	useCreateMastodonLikeMutation,
	useCreateMastodonRepostMutation,
	useDeleteMastodonLikeMutation,
	useDeleteMastodonRepostMutation,
	useMastodonAuthStatusQuery,
	useMastodonAuthorFeedInfiniteQuery,
	useMastodonAuthorProfileQuery,
	useMastodonConnectionQuery,
	useMastodonConnectionsQuery,
	useMastodonNotificationsInfiniteQuery,
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

describe( 'useMastodonNotificationsInfiniteQuery', () => {
	const PATH = '/wpcom/v2/reader/mastodon/connections/42/notifications';

	// Touch tracked properties inside the render callback so React Query's
	// `notifyOnChangeProps: 'tracked'` observer fires on later updates.
	// Without this, `fetchNextPage()` resolves but the rendered `data` /
	// `hasNextPage` lag, producing flaky pagination assertions.
	const renderNotificationsHook = (
		connectionId: number,
		wrapper: ReturnType< typeof createWrapper >
	) =>
		renderHook(
			() => {
				const q = useMastodonNotificationsInfiniteQuery( connectionId );
				void q.data;
				void q.hasNextPage;
				void q.isFetchingNextPage;
				void q.isError;
				void q.error;
				return q;
			},
			{ wrapper }
		);

	afterEach( () => nock.cleanAll() );

	it( 'is disabled when connectionId is 0', () => {
		const { result } = renderNotificationsHook( 0, createWrapper() );
		expect( result.current.fetchStatus ).toBe( 'idle' );
		expect( result.current.data ).toBeUndefined();
	} );

	it( 'fetches the first page on mount', async () => {
		nock( BASE ).get( PATH ).query( {} ).reply( 200, {
			items: [],
			next_cursor: null,
			seen_at: null,
		} );
		const { result } = renderNotificationsHook( 42, createWrapper() );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.pages[ 0 ].items ).toEqual( [] );
	} );

	it( 'paginates via next_cursor returned by the previous page', async () => {
		nock( BASE ).get( PATH ).query( {} ).reply( 200, {
			items: [],
			next_cursor: 'page-2',
			seen_at: null,
		} );
		nock( BASE )
			.get( PATH )
			.query( { cursor: 'page-2' } )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const { result } = renderNotificationsHook( 42, createWrapper() );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.hasNextPage ).toBe( true );

		await act( async () => {
			await result.current.fetchNextPage();
		} );
		expect( result.current.data?.pages.length ).toBe( 2 );
		expect( result.current.hasNextPage ).toBe( false );
	} );

	it( 'does not retry terminal errors', async () => {
		// Mirror the timeline test policy: auth_required is terminal — no
		// extra requests beyond the first. nock would throw if a retry
		// happened (only one interceptor registered).
		nock( BASE ).get( PATH ).query( {} ).reply( 401, { code: 'reader_mastodon_auth_required' } );
		const { result } = renderNotificationsHook( 42, createWrapper() );
		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( ( result.current.error as { kind: string } ).kind ).toBe( 'auth_required' );
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

const CONNECTION_ID = 42;
const TARGET_ID = '108020';
const OTHER_ID = '999999';

function makeMastodonFeedItem( overrides: Partial< MastodonFeedItem > = {} ): MastodonFeedItem {
	return {
		id: TARGET_ID,
		url: `https://mastodon.social/@alice/${ TARGET_ID }`,
		created_at: '2026-01-01T00:00:00Z',
		account: { id: '1', username: 'alice', acct: 'alice', display_name: 'Alice', avatar: null },
		content: '<p>hi</p>',
		spoiler_text: '',
		sensitive: false,
		language: 'en',
		in_reply_to_id: null,
		in_reply_to_account_id: null,
		boost: null,
		media: [],
		counts: { replies: 0, boosts: 0, favourites: 5 },
		viewer: { favourited: false, reblogged: false },
		...overrides,
	};
}

function seedTimeline(
	client: QueryClient,
	pages: MastodonTimelinePage[],
	pageParams: ( string | undefined )[]
) {
	const data: InfiniteData< MastodonTimelinePage > = { pages, pageParams };
	client.setQueryData( readerMastodonKeys.timeline( CONNECTION_ID ), data );
}

function getTimelineCache( client: QueryClient ) {
	return client.getQueryData< InfiniteData< MastodonTimelinePage > >(
		readerMastodonKeys.timeline( CONNECTION_ID )
	);
}

function seedThread( client: QueryClient, thread: MastodonThreadResponse ) {
	client.setQueryData( readerMastodonKeys.thread( CONNECTION_ID, TARGET_ID ), thread );
}

function getThreadCache( client: QueryClient ) {
	return client.getQueryData< MastodonThreadResponse >(
		readerMastodonKeys.thread( CONNECTION_ID, TARGET_ID )
	);
}

function seedTimelineWithParent(
	client: QueryClient,
	connectionId: number,
	parentId: string,
	parentReplies: number
): InfiniteData< MastodonTimelinePage > {
	const data: InfiniteData< MastodonTimelinePage > = {
		pages: [
			{
				items: [
					makeMastodonFeedItem( {
						id: parentId,
						counts: { replies: parentReplies, boosts: 0, favourites: 0 },
					} ),
				],
				cursor: null,
			},
		],
		pageParams: [ undefined ],
	};
	client.setQueryData( readerMastodonKeys.timeline( connectionId ), data );
	return data;
}

describe( 'createMastodonPostMutation', () => {
	const connectionId = 42;
	const parentId = '108020';

	afterEach( () => nock.cleanAll() );

	it( 'POSTs status to /reader/mastodon/connections/:id/statuses (standalone)', async () => {
		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ connectionId }/statuses`, {
				status: 'hello world',
			} )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		const { result } = renderHook( () => useMutation( createMastodonPostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( { connectionId, status: 'hello world' } );
		} );

		expect( result.current.data ).toEqual( {
			id: '999',
			url: 'https://mastodon.social/@me/999',
			in_reply_to_id: null,
		} );
	} );

	it( 'POSTs status + in_reply_to_id when replying', async () => {
		const scope = nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ connectionId }/statuses`, {
				status: 'a reply',
				in_reply_to_id: parentId,
			} )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: parentId,
			} );

		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		const { result } = renderHook( () => useMutation( createMastodonPostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( {
				connectionId,
				status: 'a reply',
				in_reply_to_id: parentId,
			} );
		} );

		expect( scope.isDone() ).toBe( true );
	} );

	it( 'optimistically bumps counts.replies on the parent post in the timeline cache', async () => {
		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		seedTimelineWithParent( client, connectionId, parentId, 3 );

		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ connectionId }/statuses` )
			.delay( 50 )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: parentId,
			} );

		const { result } = renderHook( () => useMutation( createMastodonPostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		let promise: Promise< unknown > = Promise.resolve();
		await act( async () => {
			promise = result.current.mutateAsync( {
				connectionId,
				status: 'a reply',
				in_reply_to_id: parentId,
			} );
			await Promise.resolve();
		} );

		await waitFor( () => {
			const timeline = client.getQueryData< InfiniteData< MastodonTimelinePage > >(
				readerMastodonKeys.timeline( connectionId )
			);
			expect( timeline?.pages[ 0 ].items[ 0 ].counts.replies ).toBe( 4 );
		} );

		await promise;
	} );

	it( 'also bumps counts.replies on the parent inside the thread cache', async () => {
		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		const initial: MastodonThreadResponse = {
			thread: {
				type: 'post',
				post: makeMastodonFeedItem( {
					id: parentId,
					counts: { replies: 1, boosts: 0, favourites: 0 },
				} ),
				parent: null,
				replies: [],
			},
		};
		client.setQueryData( readerMastodonKeys.thread( connectionId, parentId ), initial );

		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ connectionId }/statuses` )
			.delay( 50 )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: parentId,
			} );

		const { result } = renderHook( () => useMutation( createMastodonPostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		let promise: Promise< unknown > = Promise.resolve();
		await act( async () => {
			promise = result.current.mutateAsync( {
				connectionId,
				status: 'a reply',
				in_reply_to_id: parentId,
			} );
			await Promise.resolve();
		} );

		await waitFor( () => {
			const thread = client.getQueryData< MastodonThreadResponse >(
				readerMastodonKeys.thread( connectionId, parentId )
			);
			if ( thread?.thread.type !== 'post' ) {
				throw new Error( 'expected thread root to be a post node' );
			}
			expect( thread.thread.post.counts.replies ).toBe( 2 );
		} );

		await promise;
	} );

	it( 'restores the parent counts snapshot on error', async () => {
		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		seedTimelineWithParent( client, connectionId, parentId, 3 );

		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ connectionId }/statuses` )
			.reply( 500, { error: 'mastodon_upstream_unavailable' } );

		const { result } = renderHook( () => useMutation( createMastodonPostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await expect(
				result.current.mutateAsync( {
					connectionId,
					status: 'a reply',
					in_reply_to_id: parentId,
				} )
			).rejects.toBeTruthy();
		} );

		const timeline = client.getQueryData< InfiniteData< MastodonTimelinePage > >(
			readerMastodonKeys.timeline( connectionId )
		);
		expect( timeline?.pages[ 0 ].items[ 0 ].counts.replies ).toBe( 3 );
	} );

	it( 'invalidates the timeline query on success', async () => {
		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ connectionId }/statuses` )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );

		const { result } = renderHook( () => useMutation( createMastodonPostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( { connectionId, status: 'standalone' } );
		} );

		expect(
			invalidateSpy.mock.calls.some( ( [ filters ] ) => {
				const queryKey = ( filters as { queryKey?: readonly unknown[] } )?.queryKey;
				return (
					Array.isArray( queryKey ) &&
					JSON.stringify( queryKey ) ===
						JSON.stringify( readerMastodonKeys.timeline( connectionId ) )
				);
			} )
		).toBe( true );
	} );

	it( 'also invalidates the parent thread query on reply success', async () => {
		// Without this invalidate, the optimistic counts.replies bump would
		// stick but the newly-created reply would not appear in the thread
		// view until the 30s staleTime elapses — replying from a thread
		// surface looks broken to the user.
		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ connectionId }/statuses` )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: parentId,
			} );

		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );

		const { result } = renderHook( () => useMutation( createMastodonPostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( {
				connectionId,
				status: 'a reply',
				in_reply_to_id: parentId,
			} );
		} );

		expect(
			invalidateSpy.mock.calls.some( ( [ filters ] ) => {
				const queryKey = ( filters as { queryKey?: readonly unknown[] } )?.queryKey;
				return (
					Array.isArray( queryKey ) &&
					JSON.stringify( queryKey ) ===
						JSON.stringify( readerMastodonKeys.thread( connectionId, parentId ) )
				);
			} )
		).toBe( true );
	} );

	it( 'does not invalidate any thread query on standalone success', async () => {
		nock( BASE )
			.post( `/wpcom/v2/reader/mastodon/connections/${ connectionId }/statuses` )
			.reply( 200, {
				id: '999',
				url: 'https://mastodon.social/@me/999',
				in_reply_to_id: null,
			} );

		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );

		const { result } = renderHook( () => useMutation( createMastodonPostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( { connectionId, status: 'standalone' } );
		} );

		const threadKeyRoot = JSON.stringify(
			readerMastodonKeys.thread( connectionId, '' ).slice( 0, -1 )
		);
		expect(
			invalidateSpy.mock.calls.some( ( [ filters ] ) => {
				const queryKey = ( filters as { queryKey?: readonly unknown[] } )?.queryKey;
				if ( ! Array.isArray( queryKey ) ) {
					return false;
				}
				return JSON.stringify( queryKey.slice( 0, -1 ) ) === threadKeyRoot;
			} )
		).toBe( false );
	} );
} );

describe( 'useCreateMastodonLikeMutation / useDeleteMastodonLikeMutation', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'useCreateMastodonLikeMutation', () => {
		it( 'POSTs to the likes endpoint and resolves', async () => {
			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes`, {
					status_id: TARGET_ID,
				} )
				.reply( 200, {} );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const { result } = renderHook( () => useCreateMastodonLikeMutation( CONNECTION_ID ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( { statusId: TARGET_ID } );
			} );

			expect( result.current.isSuccess ).toBe( true );
		} );

		it( 'optimistically flips viewer.favourited to true and bumps counts.favourites', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 0, favourites: 5 },
				viewer: { favourited: false, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const cancelQueriesSpy = jest.spyOn( client, 'cancelQueries' );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );

			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes`, {
					status_id: TARGET_ID,
				} )
				.delay( 100 )
				.reply( 200, {} );

			const { result } = renderHook(
				() => {
					const m = useCreateMastodonLikeMutation( CONNECTION_ID );
					void m.isPending;
					void m.isSuccess;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => {
				const optimistic = getTimelineCache( client );
				expect( optimistic?.pages[ 0 ].items[ 0 ].viewer?.favourited ).toBe( true );
				expect( optimistic?.pages[ 0 ].items[ 0 ].counts.favourites ).toBe( 6 );
			} );

			// Cancellation is connection-scoped via predicate so concurrent
			// mutations on a different connection's queries aren't aborted.
			expect( cancelQueriesSpy ).toHaveBeenCalledWith( {
				predicate: expect.any( Function ),
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			// No onSuccess re-patch needed — boolean stays correct.
			const settled = getTimelineCache( client );
			expect( settled?.pages[ 0 ].items[ 0 ].viewer?.favourited ).toBe( true );
			expect( settled?.pages[ 0 ].items[ 0 ].counts.favourites ).toBe( 6 );
		} );

		it( 'rolls back to the pre-mutation snapshot on error', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 1, boosts: 2, favourites: 7 },
				viewer: { favourited: false, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
			const snapshot = getTimelineCache( client );

			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes`, {
					status_id: TARGET_ID,
				} )
				.reply( 401, { error: 'unauthorized' } );

			const { result } = renderHook(
				() => {
					const m = useCreateMastodonLikeMutation( CONNECTION_ID );
					void m.isPending;
					void m.isError;
					void m.error;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );

			expect( getTimelineCache( client ) ).toEqual( snapshot );
		} );

		it( 'patches matching posts across timeline AND thread cache (cross-surface)', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 0, favourites: 5 },
				viewer: { favourited: false, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
			seedThread( client, {
				thread: { type: 'post', post: target, parent: null, replies: [] },
			} );

			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes`, {
					status_id: TARGET_ID,
				} )
				.reply( 200, {} );

			const { result } = renderHook(
				() => {
					const m = useCreateMastodonLikeMutation( CONNECTION_ID );
					void m.isSuccess;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			// Timeline patched.
			expect( getTimelineCache( client )?.pages[ 0 ].items[ 0 ].viewer?.favourited ).toBe( true );
			expect( getTimelineCache( client )?.pages[ 0 ].items[ 0 ].counts.favourites ).toBe( 6 );

			// Thread cache also patched.
			const thread = getThreadCache( client )?.thread;
			expect( thread?.type ).toBe( 'post' );
			expect( thread?.type === 'post' ? thread.post.viewer?.favourited : null ).toBe( true );
			expect( thread?.type === 'post' ? thread.post.counts.favourites : null ).toBe( 6 );
		} );

		it( 'rolls back both timeline and thread cache on cross-surface error', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 0, favourites: 5 },
				viewer: { favourited: false, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
			seedThread( client, {
				thread: { type: 'post', post: target, parent: null, replies: [] },
			} );
			const timelineSnapshot = getTimelineCache( client );
			const threadSnapshot = getThreadCache( client );

			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes`, {
					status_id: TARGET_ID,
				} )
				.reply( 401, { error: 'unauthorized' } );

			const { result } = renderHook(
				() => {
					const m = useCreateMastodonLikeMutation( CONNECTION_ID );
					void m.isPending;
					void m.isError;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );

			expect( getTimelineCache( client ) ).toEqual( timelineSnapshot );
			expect( getThreadCache( client ) ).toEqual( threadSnapshot );
		} );
	} );

	describe( 'useDeleteMastodonLikeMutation', () => {
		it( 'DELETEs the likes endpoint and resolves', async () => {
			nock( BASE )
				.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes/${ TARGET_ID }` )
				.reply( 200, {} );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const { result } = renderHook( () => useDeleteMastodonLikeMutation( CONNECTION_ID ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( { statusId: TARGET_ID } );
			} );

			expect( result.current.isSuccess ).toBe( true );
		} );

		it( 'optimistically flips viewer.favourited to false and decrements counts.favourites', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 0, favourites: 5 },
				viewer: { favourited: true, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );

			nock( BASE )
				.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes/${ TARGET_ID }` )
				.delay( 100 )
				.reply( 200, {} );

			const { result } = renderHook(
				() => {
					const m = useDeleteMastodonLikeMutation( CONNECTION_ID );
					void m.isPending;
					void m.isSuccess;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => {
				const optimistic = getTimelineCache( client );
				expect( optimistic?.pages[ 0 ].items[ 0 ].viewer?.favourited ).toBe( false );
				expect( optimistic?.pages[ 0 ].items[ 0 ].counts.favourites ).toBe( 4 );
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			const settled = getTimelineCache( client );
			expect( settled?.pages[ 0 ].items[ 0 ].viewer?.favourited ).toBe( false );
			expect( settled?.pages[ 0 ].items[ 0 ].counts.favourites ).toBe( 4 );
		} );

		it( 'clamps counts.favourites at 0 when already zero', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 0, favourites: 0 },
				viewer: { favourited: true, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );

			nock( BASE )
				.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes/${ TARGET_ID }` )
				.reply( 200, {} );

			const { result } = renderHook(
				() => {
					const m = useDeleteMastodonLikeMutation( CONNECTION_ID );
					void m.isSuccess;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				await result.current.mutateAsync( { statusId: TARGET_ID } );
			} );

			const settled = getTimelineCache( client );
			expect( settled?.pages[ 0 ].items[ 0 ].counts.favourites ).toBe( 0 );
		} );

		it( 'rolls back to the pre-mutation snapshot on error', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 0, favourites: 5 },
				viewer: { favourited: true, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
			const snapshot = getTimelineCache( client );

			nock( BASE )
				.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes/${ TARGET_ID }` )
				.reply( 401, { error: 'unauthorized' } );

			const { result } = renderHook(
				() => {
					const m = useDeleteMastodonLikeMutation( CONNECTION_ID );
					void m.isPending;
					void m.isError;
					void m.error;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );

			expect( getTimelineCache( client ) ).toEqual( snapshot );
		} );

		it( 'patches only the matching post, does not touch a different post in the same page', async () => {
			const otherPost = makeMastodonFeedItem( {
				id: OTHER_ID,
				url: `https://mastodon.social/@bob/${ OTHER_ID }`,
				counts: { replies: 0, boosts: 0, favourites: 1 },
				viewer: { favourited: true, reblogged: false },
			} );
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 0, favourites: 5 },
				viewer: { favourited: true, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ otherPost, target ], cursor: null } ], [ undefined ] );

			nock( BASE )
				.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/likes/${ TARGET_ID }` )
				.reply( 200, {} );

			const { result } = renderHook(
				() => {
					const m = useDeleteMastodonLikeMutation( CONNECTION_ID );
					void m.isSuccess;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				await result.current.mutateAsync( { statusId: TARGET_ID } );
			} );

			const settled = getTimelineCache( client );
			// Other post untouched.
			expect( settled?.pages[ 0 ].items[ 0 ].id ).toBe( OTHER_ID );
			expect( settled?.pages[ 0 ].items[ 0 ].viewer?.favourited ).toBe( true );
			expect( settled?.pages[ 0 ].items[ 0 ].counts.favourites ).toBe( 1 );
			// Target decremented.
			expect( settled?.pages[ 0 ].items[ 1 ].id ).toBe( TARGET_ID );
			expect( settled?.pages[ 0 ].items[ 1 ].viewer?.favourited ).toBe( false );
			expect( settled?.pages[ 0 ].items[ 1 ].counts.favourites ).toBe( 4 );
		} );
	} );
} );

describe( 'useCreateMastodonRepostMutation / useDeleteMastodonRepostMutation', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'useCreateMastodonRepostMutation', () => {
		it( 'POSTs to the reposts endpoint and resolves', async () => {
			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts`, {
					status_id: TARGET_ID,
				} )
				.reply( 200, {} );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const { result } = renderHook( () => useCreateMastodonRepostMutation( CONNECTION_ID ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( { statusId: TARGET_ID } );
			} );

			expect( result.current.isSuccess ).toBe( true );
		} );

		it( 'optimistically flips viewer.reblogged to true and bumps counts.boosts', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 3, favourites: 5 },
				viewer: { favourited: false, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const cancelQueriesSpy = jest.spyOn( client, 'cancelQueries' );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );

			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts`, {
					status_id: TARGET_ID,
				} )
				.delay( 100 )
				.reply( 200, {} );

			const { result } = renderHook(
				() => {
					const m = useCreateMastodonRepostMutation( CONNECTION_ID );
					void m.isPending;
					void m.isSuccess;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => {
				const optimistic = getTimelineCache( client );
				expect( optimistic?.pages[ 0 ].items[ 0 ].viewer?.reblogged ).toBe( true );
				expect( optimistic?.pages[ 0 ].items[ 0 ].counts.boosts ).toBe( 4 );
			} );

			// Cancellation is connection-scoped via predicate so concurrent
			// mutations on a different connection's queries aren't aborted.
			expect( cancelQueriesSpy ).toHaveBeenCalledWith( {
				predicate: expect.any( Function ),
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			// No onSuccess re-patch needed — boolean stays correct.
			const settled = getTimelineCache( client );
			expect( settled?.pages[ 0 ].items[ 0 ].viewer?.reblogged ).toBe( true );
			expect( settled?.pages[ 0 ].items[ 0 ].counts.boosts ).toBe( 4 );
		} );

		it( 'rolls back to the pre-mutation snapshot on error', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 1, boosts: 2, favourites: 7 },
				viewer: { favourited: false, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
			const snapshot = getTimelineCache( client );

			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts`, {
					status_id: TARGET_ID,
				} )
				.reply( 401, { error: 'unauthorized' } );

			const { result } = renderHook(
				() => {
					const m = useCreateMastodonRepostMutation( CONNECTION_ID );
					void m.isPending;
					void m.isError;
					void m.error;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );

			expect( getTimelineCache( client ) ).toEqual( snapshot );
		} );

		it( 'patches matching posts across timeline AND thread cache (cross-surface)', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 3, favourites: 5 },
				viewer: { favourited: false, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
			seedThread( client, {
				thread: { type: 'post', post: target, parent: null, replies: [] },
			} );

			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts`, {
					status_id: TARGET_ID,
				} )
				.reply( 200, {} );

			const { result } = renderHook(
				() => {
					const m = useCreateMastodonRepostMutation( CONNECTION_ID );
					void m.isSuccess;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			// Timeline patched.
			expect( getTimelineCache( client )?.pages[ 0 ].items[ 0 ].viewer?.reblogged ).toBe( true );
			expect( getTimelineCache( client )?.pages[ 0 ].items[ 0 ].counts.boosts ).toBe( 4 );

			// Thread cache also patched.
			const thread = getThreadCache( client )?.thread;
			expect( thread?.type ).toBe( 'post' );
			expect( thread?.type === 'post' ? thread.post.viewer?.reblogged : null ).toBe( true );
			expect( thread?.type === 'post' ? thread.post.counts.boosts : null ).toBe( 4 );
		} );

		it( 'rolls back both timeline and thread cache on cross-surface error', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 3, favourites: 5 },
				viewer: { favourited: false, reblogged: false },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
			seedThread( client, {
				thread: { type: 'post', post: target, parent: null, replies: [] },
			} );
			const timelineSnapshot = getTimelineCache( client );
			const threadSnapshot = getThreadCache( client );

			nock( BASE )
				.post( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts`, {
					status_id: TARGET_ID,
				} )
				.reply( 401, { error: 'unauthorized' } );

			const { result } = renderHook(
				() => {
					const m = useCreateMastodonRepostMutation( CONNECTION_ID );
					void m.isPending;
					void m.isError;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );

			expect( getTimelineCache( client ) ).toEqual( timelineSnapshot );
			expect( getThreadCache( client ) ).toEqual( threadSnapshot );
		} );
	} );

	describe( 'useDeleteMastodonRepostMutation', () => {
		it( 'DELETEs the reposts endpoint and resolves', async () => {
			nock( BASE )
				.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts/${ TARGET_ID }` )
				.reply( 200, {} );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const { result } = renderHook( () => useDeleteMastodonRepostMutation( CONNECTION_ID ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( { statusId: TARGET_ID } );
			} );

			expect( result.current.isSuccess ).toBe( true );
		} );

		it( 'optimistically flips viewer.reblogged to false and decrements counts.boosts', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 3, favourites: 5 },
				viewer: { favourited: false, reblogged: true },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );

			nock( BASE )
				.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts/${ TARGET_ID }` )
				.delay( 100 )
				.reply( 200, {} );

			const { result } = renderHook(
				() => {
					const m = useDeleteMastodonRepostMutation( CONNECTION_ID );
					void m.isPending;
					void m.isSuccess;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => {
				const optimistic = getTimelineCache( client );
				expect( optimistic?.pages[ 0 ].items[ 0 ].viewer?.reblogged ).toBe( false );
				expect( optimistic?.pages[ 0 ].items[ 0 ].counts.boosts ).toBe( 2 );
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			const settled = getTimelineCache( client );
			expect( settled?.pages[ 0 ].items[ 0 ].viewer?.reblogged ).toBe( false );
			expect( settled?.pages[ 0 ].items[ 0 ].counts.boosts ).toBe( 2 );
		} );

		it( 'rolls back to the pre-mutation snapshot on error', async () => {
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 3, favourites: 5 },
				viewer: { favourited: false, reblogged: true },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
			const snapshot = getTimelineCache( client );

			nock( BASE )
				.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts/${ TARGET_ID }` )
				.reply( 401, { error: 'unauthorized' } );

			const { result } = renderHook(
				() => {
					const m = useDeleteMastodonRepostMutation( CONNECTION_ID );
					void m.isPending;
					void m.isError;
					void m.error;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				result.current.mutate( { statusId: TARGET_ID } );
				await Promise.resolve();
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );

			expect( getTimelineCache( client ) ).toEqual( snapshot );
		} );

		it( 'patches only the matching post, does not touch a different post in the same page', async () => {
			const otherPost = makeMastodonFeedItem( {
				id: OTHER_ID,
				url: `https://mastodon.social/@bob/${ OTHER_ID }`,
				counts: { replies: 0, boosts: 1, favourites: 2 },
				viewer: { favourited: false, reblogged: true },
			} );
			const target = makeMastodonFeedItem( {
				counts: { replies: 0, boosts: 3, favourites: 5 },
				viewer: { favourited: false, reblogged: true },
			} );
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline( client, [ { items: [ otherPost, target ], cursor: null } ], [ undefined ] );

			nock( BASE )
				.delete( `/wpcom/v2/reader/mastodon/connections/${ CONNECTION_ID }/reposts/${ TARGET_ID }` )
				.reply( 200, {} );

			const { result } = renderHook(
				() => {
					const m = useDeleteMastodonRepostMutation( CONNECTION_ID );
					void m.isSuccess;
					return m;
				},
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				await result.current.mutateAsync( { statusId: TARGET_ID } );
			} );

			const settled = getTimelineCache( client );
			// Other post untouched.
			expect( settled?.pages[ 0 ].items[ 0 ].id ).toBe( OTHER_ID );
			expect( settled?.pages[ 0 ].items[ 0 ].viewer?.reblogged ).toBe( true );
			expect( settled?.pages[ 0 ].items[ 0 ].counts.boosts ).toBe( 1 );
			// Target decremented.
			expect( settled?.pages[ 0 ].items[ 1 ].id ).toBe( TARGET_ID );
			expect( settled?.pages[ 0 ].items[ 1 ].viewer?.reblogged ).toBe( false );
			expect( settled?.pages[ 0 ].items[ 1 ].counts.boosts ).toBe( 2 );
		} );
	} );
} );

describe( 'uploadMastodonMediaMutation', () => {
	it( 'returns mutationOptions wrapping uploadMastodonMedia', () => {
		const opts = uploadMastodonMediaMutation();
		expect( typeof opts.mutationFn ).toBe( 'function' );
		// mutationKey intentionally absent — composer-config types Omit it.
		expect( ( opts as Record< string, unknown > ).mutationKey ).toBeUndefined();
	} );
} );

describe( 'followMastodonActorMutation / unfollowMastodonActorMutation', () => {
	afterEach( () => nock.cleanAll() );

	function makeProfile( overrides: Partial< MastodonAuthorProfile > = {} ): MastodonAuthorProfile {
		return {
			id: '200',
			acct: 'alice@mastodon.social',
			display_name: 'Alice',
			avatar: null,
			header: null,
			note: '',
			counts: { followers: 10, following: 5, posts: 42 },
			locked: false,
			raw: {},
			viewer: { following: false, followed_by: false, requested: false },
			is_self: false,
			...overrides,
		};
	}

	describe( 'followMastodonActorMutation', () => {
		it( 'optimistically sets viewer.following=true on follow', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			client.setQueryData( key, makeProfile() );

			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/1/follows' )
				.reply( 200, {
					viewer: { following: true, followed_by: false, requested: false },
				} );

			const { result } = renderHook( () => useMutation( followMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: '200',
					accountId: '200',
				} );
			} );

			const cached = client.getQueryData< MastodonAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( true );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'optimistically sets viewer.requested=true (not following) on follow when vars.locked is true', async () => {
			// Without the locked branch the patch would write `following: true`
			// for the duration of the round-trip, then snap to `requested: true`
			// on commit — a UX flip-flop and a misleading mid-flight aria-label.
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			client.setQueryData( key, makeProfile( { locked: true } ) );

			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/1/follows' )
				.delay( 50 )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: true },
				} );

			const { result } = renderHook( () => useMutation( followMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let inFlight: Promise< unknown > | undefined;
			act( () => {
				inFlight = result.current.mutateAsync( {
					connectionId: 1,
					actor: '200',
					accountId: '200',
					locked: true,
				} );
			} );

			// Wait for onMutate to resolve before reading the cache — the
			// optimistic patch lands synchronously after cancelQueries settles.
			await waitFor( () => {
				const mid = client.getQueryData< MastodonAuthorProfile >( key );
				expect( mid?.viewer?.requested ).toBe( true );
				expect( mid?.viewer?.following ).toBe( false );
			} );

			await act( async () => {
				await inFlight;
			} );
		} );

		it( 'vars.locked wins over old.locked when both are defined', async () => {
			// Edge case: cached profile says locked but the call site has fresher
			// information (e.g. the target unlocked their account between the
			// profile fetch and the click). vars.locked: false should drive the
			// optimistic patch even though old.locked is true.
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			client.setQueryData( key, makeProfile( { locked: true } ) );

			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/1/follows' )
				.delay( 50 )
				.reply( 200, {
					viewer: { following: true, followed_by: false, requested: false },
				} );

			const { result } = renderHook( () => useMutation( followMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let inFlight: Promise< unknown > | undefined;
			act( () => {
				inFlight = result.current.mutateAsync( {
					connectionId: 1,
					actor: '200',
					accountId: '200',
					locked: false,
				} );
			} );

			await waitFor( () => {
				const mid = client.getQueryData< MastodonAuthorProfile >( key );
				expect( mid?.viewer?.following ).toBe( true );
				expect( mid?.viewer?.requested ).toBe( false );
			} );

			await act( async () => {
				await inFlight;
			} );
		} );

		it( 'falls back to old.locked when vars.locked is omitted', async () => {
			// Backwards-compat: callers that haven't yet threaded `locked` into
			// vars still get the right optimistic patch by reading the cached
			// profile's `locked` flag.
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			client.setQueryData( key, makeProfile( { locked: true } ) );

			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/1/follows' )
				.delay( 50 )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: true },
				} );

			const { result } = renderHook( () => useMutation( followMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let inFlight: Promise< unknown > | undefined;
			act( () => {
				inFlight = result.current.mutateAsync( {
					connectionId: 1,
					actor: '200',
					accountId: '200',
				} );
			} );

			await waitFor( () => {
				const mid = client.getQueryData< MastodonAuthorProfile >( key );
				expect( mid?.viewer?.requested ).toBe( true );
				expect( mid?.viewer?.following ).toBe( false );
			} );

			await act( async () => {
				await inFlight;
			} );
		} );

		it( 'commits requested: true from server response (locked account)', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			client.setQueryData( key, makeProfile( { locked: true } ) );

			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/1/follows' )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: true },
				} );

			const { result } = renderHook( () => useMutation( followMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: '200',
					accountId: '200',
				} );
			} );

			const cached = client.getQueryData< MastodonAuthorProfile >( key );
			expect( cached?.viewer?.requested ).toBe( true );
			expect( cached?.viewer?.following ).toBe( false );
		} );

		it( 'rolls back to previous viewer on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			client.setQueryData( key, makeProfile() );

			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/1/follows' )
				.reply( 502, { code: 'reader_mastodon_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( followMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId: 1,
						actor: '200',
						accountId: '200',
					} );
				} catch {
					// expected
				}
			} );

			const cached = client.getQueryData< MastodonAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( false );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'normalizes the actor when keying the cache so webfinger handles still see the optimistic patch', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			// Seed under the NORMALIZED key — this is what the query layer
			// (mastodonAuthorProfileQueryOptions) writes to.
			const normalizedKey = readerMastodonKeys.authorProfile( 1, 'alice@mastodon.social' );
			client.setQueryData( normalizedKey, makeProfile() );

			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/1/follows' )
				.reply( 200, {
					viewer: { following: true, followed_by: false, requested: false },
				} );

			const { result } = renderHook( () => useMutation( followMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			// Drive the mutation with the UNNORMALIZED webfinger form — the
			// panel can pass '@Alice@MASTODON.social' when the URL came
			// from a federated mention link.
			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: '@Alice@MASTODON.social',
					accountId: '200',
				} );
			} );

			const cached = client.getQueryData< MastodonAuthorProfile >( normalizedKey );
			expect( cached?.viewer?.following ).toBe( true );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'invalidates the cache on error when there is no previous snapshot to roll back to', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			// No setQueryData seeding — context.previous will be undefined,
			// so onError must fall back to invalidateQueries to avoid
			// leaving an optimistic patch as a stale cache value.
			const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );

			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/1/follows' )
				.reply( 502, { code: 'reader_mastodon_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( followMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId: 1,
						actor: '200',
						accountId: '200',
					} );
				} catch {
					// expected
				}
			} );

			expect( invalidateSpy ).toHaveBeenCalledWith( { queryKey: key } );
			invalidateSpy.mockRestore();
		} );

		it( 'invalidates the cache on success when the entry was evicted between onMutate and onSuccess', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			client.setQueryData( key, makeProfile() );

			nock( BASE )
				.post( '/wpcom/v2/reader/mastodon/connections/1/follows' )
				.reply( 200, {
					viewer: { following: true, followed_by: false, requested: false },
				} );

			const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );

			const { result } = renderHook( () => useMutation( followMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			// Simulate a route change evicting the cached profile while
			// the mutation is in flight; setQueryData on a missing entry
			// returns undefined, so onSuccess must invalidate to refetch
			// the authoritative server viewer.
			await act( async () => {
				const promise = result.current.mutateAsync( {
					connectionId: 1,
					actor: '200',
					accountId: '200',
				} );
				client.removeQueries( { queryKey: key } );
				await promise;
			} );

			expect( invalidateSpy ).toHaveBeenCalledWith( { queryKey: key } );
			invalidateSpy.mockRestore();
		} );
	} );

	describe( 'unfollowMastodonActorMutation', () => {
		it( 'optimistically clears viewer.following and viewer.requested on unfollow', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			client.setQueryData(
				key,
				makeProfile( {
					locked: true,
					viewer: { following: false, followed_by: false, requested: true },
				} )
			);

			nock( BASE )
				.delete( '/wpcom/v2/reader/mastodon/connections/1/follows/200' )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: false },
				} );

			const { result } = renderHook( () => useMutation( unfollowMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: '200',
					accountId: '200',
				} );
			} );

			const cached = client.getQueryData< MastodonAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( false );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'rolls back to previous viewer on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerMastodonKeys.authorProfile( 1, '200' );
			client.setQueryData(
				key,
				makeProfile( {
					viewer: { following: true, followed_by: false, requested: false },
				} )
			);

			nock( BASE )
				.delete( '/wpcom/v2/reader/mastodon/connections/1/follows/200' )
				.reply( 502, { code: 'reader_mastodon_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( unfollowMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId: 1,
						actor: '200',
						accountId: '200',
					} );
				} catch {
					// expected
				}
			} );

			const cached = client.getQueryData< MastodonAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( true );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'normalizes the actor when keying the cache so webfinger handles still see the optimistic patch', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const normalizedKey = readerMastodonKeys.authorProfile( 1, 'alice@mastodon.social' );
			client.setQueryData(
				normalizedKey,
				makeProfile( {
					viewer: { following: true, followed_by: false, requested: false },
				} )
			);

			nock( BASE )
				.delete( '/wpcom/v2/reader/mastodon/connections/1/follows/200' )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: false },
				} );

			const { result } = renderHook( () => useMutation( unfollowMastodonActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: '@Alice@MASTODON.social',
					accountId: '200',
				} );
			} );

			const cached = client.getQueryData< MastodonAuthorProfile >( normalizedKey );
			expect( cached?.viewer?.following ).toBe( false );
		} );
	} );
} );

describe( 'useMastodonAuthStatusQuery', () => {
	afterEach( () => nock.cleanAll() );

	it( 'returns needs_reauth from the auth-status endpoint', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/mastodon/connections/42/auth-status' )
			.reply( 200, { needs_reauth: true } );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useMastodonAuthStatusQuery( 42 ), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.data ).toEqual( { needs_reauth: true } ) );
	} );

	it( 'is disabled when connectionId is null', () => {
		const client = new QueryClient();
		const { result } = renderHook( () => useMastodonAuthStatusQuery( null ), {
			wrapper: makeWrapper( client ),
		} );
		expect( result.current.fetchStatus ).toBe( 'idle' );
	} );

	it( 'mastodonAuthStatusQueryOptions(null) is disabled', () => {
		expect( mastodonAuthStatusQueryOptions( null ).enabled ).toBe( false );
	} );
} );

describe.each( [
	[ 'mastodonActorFollowersInfiniteQuery', mastodonActorFollowersInfiniteQuery ],
	[ 'mastodonActorFollowingInfiniteQuery', mastodonActorFollowingInfiniteQuery ],
] )( '%s enabled gating', ( _name, factory ) => {
	const validParams = { connectionId: 1, actor: 'alice@mastodon.social' };

	it( 'is enabled by default when connectionId and actor are valid', () => {
		expect( factory( validParams ).enabled ).toBe( true );
	} );

	it( 'is enabled when `enabled: true` is passed explicitly', () => {
		expect( factory( { ...validParams, enabled: true } ).enabled ).toBe( true );
	} );

	it( 'is disabled when `enabled: false` overrides otherwise-valid params', () => {
		expect( factory( { ...validParams, enabled: false } ).enabled ).toBe( false );
	} );

	it( 'stays disabled when connectionId is invalid even with `enabled: true`', () => {
		expect( factory( { ...validParams, connectionId: 0, enabled: true } ).enabled ).toBe( false );
	} );

	it( 'stays disabled when actor is empty even with `enabled: true`', () => {
		expect( factory( { ...validParams, actor: '', enabled: true } ).enabled ).toBe( false );
	} );
} );
