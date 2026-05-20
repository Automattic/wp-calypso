// `logToLogstash` fires a real HTTPS request to the wpcom logstash
// endpoint. Mute it so the optimistic-mutation onError tests don't
// trigger an unmocked nock request.
jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

import {
	PENDING_FEDIVERSE_POST_URI,
	readerFediverseKeys,
	type FediverseAuthorProfile,
	type FediverseFeedItem,
	type FediverseTimelinePage,
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
	createFediversePostMutation,
	followFediverseActorMutation,
	normalizeFediverseActor,
	unfollowFediverseActorMutation,
	useFediverseNotificationsInfiniteQuery,
} from '../reader-fediverse';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper( c: QueryClient ) {
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ c }>{ children }</QueryClientProvider>;
	}
	return Wrapper;
}

function makeProfile( overrides: Partial< FediverseAuthorProfile > = {} ): FediverseAuthorProfile {
	return {
		id: 'https://example.com/users/alice',
		username: 'alice',
		acct: '@alice@example.com',
		handle: '@alice@example.com',
		instance: 'example.com',
		display_name: 'Alice',
		note: '',
		avatar: null,
		header: null,
		url: 'https://example.com/@alice',
		locked: false,
		counts: { followers: 10, following: 5, posts: 42 },
		viewer: { following: false, followed_by: false, requested: false },
		is_self: false,
		...overrides,
	};
}

describe( 'followFediverseActorMutation / unfollowFediverseActorMutation', () => {
	afterEach( () => nock.cleanAll() );

	describe( 'followFediverseActorMutation', () => {
		it( 'optimistically sets viewer.following=true on follow (unlocked target)', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( key, makeProfile() );

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.reply( 200, {
					viewer: { following: true, followed_by: false, requested: false },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
				} );
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( true );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'optimistically sets viewer.requested=true (not following) when vars.locked is true', async () => {
			// Without the locked branch the patch would write `following: true`
			// for the duration of the round-trip, then snap to `requested: true`
			// on commit — a UX flip-flop and a misleading mid-flight aria-label.
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( key, makeProfile( { locked: true } ) );

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.delay( 50 )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: true },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let inFlight: Promise< unknown > | undefined;
			act( () => {
				inFlight = result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
					locked: true,
				} );
			} );

			// Wait for onMutate to resolve before reading the cache — the
			// optimistic patch lands synchronously after cancelQueries settles.
			await waitFor( () => {
				const mid = client.getQueryData< FediverseAuthorProfile >( key );
				expect( mid?.viewer?.requested ).toBe( true );
				expect( mid?.viewer?.following ).toBe( false );
			} );

			await act( async () => {
				await inFlight;
			} );
		} );

		it( 'falls back to cached `locked` when vars.locked is omitted', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( key, makeProfile( { locked: true } ) );

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.delay( 50 )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: true },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let inFlight: Promise< unknown > | undefined;
			act( () => {
				inFlight = result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
				} );
			} );

			await waitFor( () => {
				const mid = client.getQueryData< FediverseAuthorProfile >( key );
				expect( mid?.viewer?.requested ).toBe( true );
			} );

			await act( async () => {
				await inFlight;
			} );
		} );

		it( 'rolls back to previous viewer on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData(
				key,
				makeProfile( {
					viewer: { following: false, followed_by: false, requested: false },
				} )
			);

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.reply( 502, { code: 'reader_fediverse_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId: 1,
						actor: 'alice@example.com',
					} );
				} catch {
					// expected
				}
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( false );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'commits server `viewer` on success (overrides the optimistic patch)', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( key, makeProfile() );

			// Server says "requested" even though we optimistically wrote
			// "following: true" — the locked state changed between the cache
			// snapshot and the server commit.
			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.reply( 200, {
					viewer: { following: false, followed_by: true, requested: true },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
				} );
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer ).toEqual( {
				following: false,
				followed_by: true,
				requested: true,
			} );
		} );
	} );

	describe( 'unfollowFediverseActorMutation', () => {
		it( 'optimistically clears viewer.following and viewer.requested on unfollow', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData(
				key,
				makeProfile( {
					locked: true,
					viewer: { following: false, followed_by: false, requested: true },
				} )
			);

			nock( BASE )
				.delete( '/wpcom/v2/reader/fediverse/connections/1/follows/alice%40example.com' )
				.reply( 200, {
					viewer: { following: false, followed_by: false, requested: false },
				} );

			const { result } = renderHook(
				() => useMutation( unfollowFediverseActorMutation( client ) ),
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice@example.com',
				} );
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( false );
			expect( cached?.viewer?.requested ).toBe( false );
		} );

		it( 'rolls back to previous viewer on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData(
				key,
				makeProfile( {
					viewer: { following: true, followed_by: false, requested: false },
				} )
			);

			nock( BASE )
				.delete( '/wpcom/v2/reader/fediverse/connections/1/follows/alice%40example.com' )
				.reply( 502, { code: 'reader_fediverse_upstream_unavailable' } );

			const { result } = renderHook(
				() => useMutation( unfollowFediverseActorMutation( client ) ),
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId: 1,
						actor: 'alice@example.com',
					} );
				} catch {
					// expected
				}
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( key );
			expect( cached?.viewer?.following ).toBe( true );
			expect( cached?.viewer?.requested ).toBe( false );
		} );
	} );

	describe( 'cache key normalization', () => {
		it( 'follow optimistic patch hits the normalized cache key for webfinger actors', async () => {
			// Profile cache is keyed under the normalized form `alice@example.com`.
			// The caller passes `@Alice@EXAMPLE.com` (mixed-case, leading @); the
			// mutation must hit the same key for the optimistic patch to land.
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const normalizedKey = readerFediverseKeys.authorProfile( 1, 'alice@example.com' );
			client.setQueryData( normalizedKey, makeProfile() );

			nock( BASE )
				.post( '/wpcom/v2/reader/fediverse/connections/1/follows' )
				.reply( 200, {
					viewer: { following: true, followed_by: false, requested: false },
				} );

			const { result } = renderHook( () => useMutation( followFediverseActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: '@Alice@EXAMPLE.com',
				} );
			} );

			const cached = client.getQueryData< FediverseAuthorProfile >( normalizedKey );
			expect( cached?.viewer?.following ).toBe( true );
		} );
	} );
} );

describe( 'normalizeFediverseActor', () => {
	it( 'strips a leading `@` and lowercases webfinger handles', () => {
		expect( normalizeFediverseActor( '@Alice@EXAMPLE.com' ) ).toBe( 'alice@example.com' );
	} );

	it( 'leaves bare webfinger handles unchanged once lowercased', () => {
		expect( normalizeFediverseActor( 'alice@example.com' ) ).toBe( 'alice@example.com' );
	} );

	it( 'preserves URL-shaped actors verbatim (case-sensitive paths)', () => {
		// Lowercasing a URL would change the path component on
		// case-sensitive servers and silently break lookups; URLs round-trip
		// trimmed only.
		expect( normalizeFediverseActor( 'https://Example.com/Users/Alice' ) ).toBe(
			'https://Example.com/Users/Alice'
		);
		expect( normalizeFediverseActor( '  https://example.com/users/alice  ' ) ).toBe(
			'https://example.com/users/alice'
		);
	} );

	it( 'recognises http (not just https) URL-shaped actors', () => {
		expect( normalizeFediverseActor( 'http://Example.com/Users/Bob' ) ).toBe(
			'http://Example.com/Users/Bob'
		);
	} );
} );

describe( 'createFediversePostMutation', () => {
	afterEach( () => nock.cleanAll() );

	function makeItem( overrides: Partial< FediverseFeedItem > = {} ): FediverseFeedItem {
		return {
			id: 'https://example.com/users/me/statuses/1',
			url: 'https://example.com/users/me/statuses/1',
			created_at: '2026-05-11T10:00:00Z',
			account: {
				id: '1',
				username: 'me',
				acct: 'me',
				display_name: 'Me',
				avatar: null,
			},
			content: '<p>hi</p>',
			spoiler_text: '',
			sensitive: false,
			language: null,
			in_reply_to_id: null,
			in_reply_to_account_id: null,
			boost: null,
			media: [],
			counts: { replies: 0, boosts: 0, favourites: 0 },
			...overrides,
		};
	}

	function seedTimeline( client: QueryClient, connectionId: number, items: FediverseFeedItem[] ) {
		const key = readerFediverseKeys.timeline( connectionId );
		const page: FediverseTimelinePage = { items, cursor: null };
		client.setQueryData< InfiniteData< FediverseTimelinePage > >( key, {
			pages: [ page ],
			pageParams: [ undefined ],
		} );
		return key;
	}

	it( 'optimistically prepends a placeholder to the timeline cache and commits the server item on success', async () => {
		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		const existing = makeItem( {
			id: 'https://example.com/users/me/statuses/0',
			content: '<p>old</p>',
		} );
		const key = seedTimeline( client, 1, [ existing ] );

		const serverItem = makeItem( {
			id: 'https://example.com/users/me/statuses/100',
			content: '<p>new</p>',
		} );
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/1/posts' )
			// Delay long enough for the mid-flight placeholder assertion to
			// observe the optimistic-patch state before onSuccess runs.
			.delay( 200 )
			.reply( 200, { post: serverItem } );

		const { result } = renderHook( () => useMutation( createFediversePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		let inFlight: Promise< unknown > | undefined;
		act( () => {
			inFlight = result.current.mutateAsync( {
				connectionId: 1,
				content: 'new',
				visibility: 'public',
			} );
		} );

		// Mid-flight: placeholder is prepended.
		await waitFor( () => {
			const data = client.getQueryData< InfiniteData< FediverseTimelinePage > >( key );
			expect( data?.pages[ 0 ].items.length ).toBe( 2 );
			expect( data?.pages[ 0 ].items[ 0 ].id.startsWith( PENDING_FEDIVERSE_POST_URI ) ).toBe(
				true
			);
		} );

		await act( async () => {
			await inFlight;
		} );

		const settled = client.getQueryData< InfiniteData< FediverseTimelinePage > >( key );
		// Placeholder replaced by the server item; existing row preserved.
		expect( settled?.pages[ 0 ].items[ 0 ].id ).toBe( 'https://example.com/users/me/statuses/100' );
		expect( settled?.pages[ 0 ].items[ 1 ].id ).toBe( 'https://example.com/users/me/statuses/0' );
	} );

	it( 'rolls back the optimistic prepend on error', async () => {
		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		const existing = makeItem( { id: 'https://example.com/users/me/statuses/0' } );
		const key = seedTimeline( client, 1, [ existing ] );

		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/1/posts' )
			.reply( 502, { error: 'fediverse_target_unavailable' } );

		const { result } = renderHook( () => useMutation( createFediversePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			try {
				await result.current.mutateAsync( {
					connectionId: 1,
					content: 'new',
					visibility: 'public',
				} );
			} catch {
				// expected
			}
		} );

		const settled = client.getQueryData< InfiniteData< FediverseTimelinePage > >( key );
		expect( settled?.pages[ 0 ].items.length ).toBe( 1 );
		expect( settled?.pages[ 0 ].items[ 0 ].id ).toBe( 'https://example.com/users/me/statuses/0' );
	} );

	it( 'forwards the idempotency key from vars into the POST headers', async () => {
		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		seedTimeline( client, 1, [] );

		const scope = nock( BASE, {
			reqheaders: { 'idempotency-key': 'fixed-uuid-abc' },
		} )
			.post( '/wpcom/v2/reader/fediverse/connections/1/posts' )
			.reply( 200, { post: makeItem() } );

		const { result } = renderHook( () => useMutation( createFediversePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		await act( async () => {
			await result.current.mutateAsync( {
				connectionId: 1,
				content: 'hi',
				visibility: 'public',
				idempotencyKey: 'fixed-uuid-abc',
			} );
		} );

		expect( scope.isDone() ).toBe( true );
	} );

	it( 'hydrates the placeholder author from the cached connection when available', async () => {
		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		// Seed the connections cache so the optimistic placeholder can pick up
		// the user's avatar / handle / display name instead of rendering with
		// empty author fields while the request is in flight.
		client.setQueryData( readerFediverseKeys.connections(), {
			connections: [
				{
					id: 1,
					blog_id: 100,
					url: 'https://example.com',
					name: 'Example Blog',
					icon: 'https://example.com/icon.png',
					webfinger: '@example@example.com',
				},
			],
		} );
		const key = seedTimeline( client, 1, [] );

		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/1/posts' )
			.delay( 200 )
			.reply( 200, { post: makeItem() } );

		const { result } = renderHook( () => useMutation( createFediversePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		let inFlight: Promise< unknown > | undefined;
		act( () => {
			inFlight = result.current.mutateAsync( {
				connectionId: 1,
				content: 'hi',
				visibility: 'public',
			} );
		} );

		await waitFor( () => {
			const data = client.getQueryData< InfiniteData< FediverseTimelinePage > >( key );
			const placeholder = data?.pages[ 0 ].items[ 0 ];
			expect( placeholder?.id.startsWith( PENDING_FEDIVERSE_POST_URI ) ).toBe( true );
			expect( placeholder?.account.display_name ).toBe( 'Example Blog' );
			expect( placeholder?.account.avatar ).toBe( 'https://example.com/icon.png' );
			expect( placeholder?.account.acct ).toBe( 'example@example.com' );
		} );

		await act( async () => {
			await inFlight;
		} );
	} );

	it( 'generates a fresh PENDING_FEDIVERSE_POST_URI per submit so back-to-back composes can coexist', async () => {
		const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
		const key = seedTimeline( client, 1, [] );

		// Two submits back-to-back with delayed servers — the second prepend
		// must not collide with the first placeholder.
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/1/posts' )
			.delay( 50 )
			.reply( 200, { post: makeItem( { id: 'first' } ) } );
		nock( BASE )
			.post( '/wpcom/v2/reader/fediverse/connections/1/posts' )
			.delay( 50 )
			.reply( 200, { post: makeItem( { id: 'second' } ) } );

		const { result } = renderHook( () => useMutation( createFediversePostMutation( client ) ), {
			wrapper: makeWrapper( client ),
		} );

		let firstSubmit: Promise< unknown > | undefined;
		let secondSubmit: Promise< unknown > | undefined;
		act( () => {
			firstSubmit = result.current.mutateAsync( {
				connectionId: 1,
				content: 'first',
				visibility: 'public',
			} );
			secondSubmit = result.current.mutateAsync( {
				connectionId: 1,
				content: 'second',
				visibility: 'public',
			} );
		} );

		await waitFor( () => {
			const data = client.getQueryData< InfiniteData< FediverseTimelinePage > >( key );
			const placeholderIds = ( data?.pages[ 0 ].items ?? [] )
				.map( ( item ) => item.id )
				.filter( ( id ) => id.startsWith( PENDING_FEDIVERSE_POST_URI ) );
			expect( placeholderIds.length ).toBe( 2 );
			// Distinct counter-suffixes — siblings can be told apart.
			expect( new Set( placeholderIds ).size ).toBe( 2 );
		} );

		await act( async () => {
			await Promise.all( [ firstSubmit, secondSubmit ] );
		} );
	} );
} );

describe( 'useFediverseNotificationsInfiniteQuery', () => {
	const PATH = '/wpcom/v2/reader/fediverse/connections/42/notifications';

	function createWrapper() {
		const client = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );
		return makeWrapper( client );
	}

	// Touch tracked properties inside the render callback so React Query's
	// `notifyOnChangeProps: 'tracked'` observer fires on later updates.
	// Without this, `fetchNextPage()` resolves but the rendered `data` /
	// `hasNextPage` lag, producing flaky pagination assertions. Mirrors
	// the mastodon notifications-query helper.
	const renderNotificationsHook = (
		connectionId: number,
		wrapper: ReturnType< typeof createWrapper >
	) =>
		renderHook(
			() => {
				const q = useFediverseNotificationsInfiniteQuery( connectionId );
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
		nock( BASE ).get( PATH ).query( {} ).reply( 401, {
			code: 'reader_fediverse_auth_required',
		} );
		const { result } = renderNotificationsHook( 42, createWrapper() );
		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( ( result.current.error as { kind: string } ).kind ).toBe( 'auth_required' );
	} );
} );

describe( 'useFediverseNotificationsInfiniteQuery — filter', () => {
	let wrapper: ReturnType< typeof makeWrapper >;

	beforeEach( () => {
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		wrapper = makeWrapper( client );
	} );

	afterEach( () => nock.cleanAll() );

	it( 'forwards filter as types= query param', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( { types: 'like' } )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const { result } = renderHook(
			() => useFediverseNotificationsInfiniteQuery( 101, { filter: 'likes' } ),
			{ wrapper }
		);
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );

	it( 'omits types= when filter is "all"', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const { result } = renderHook(
			() => useFediverseNotificationsInfiniteQuery( 101, { filter: 'all' } ),
			{ wrapper }
		);
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );

	it( 'each filter caches under its own query key', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( {} )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } )
			.get( '/wpcom/v2/reader/fediverse/connections/101/notifications' )
			.query( { types: 'like' } )
			.reply( 200, { items: [], next_cursor: null, seen_at: null } );

		const { result, rerender } = renderHook(
			( { filter }: { filter: 'all' | 'likes' } ) =>
				useFediverseNotificationsInfiniteQuery( 101, { filter } ),
			{ wrapper, initialProps: { filter: 'all' as const } }
		);
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		rerender( { filter: 'likes' as const } );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( nock.isDone() ).toBe( true );
	} );
} );
