import {
	PENDING_LIKE_URI,
	PENDING_POST_URI,
	PENDING_REPLY_URI,
	PENDING_REPOST_URI,
	readerAtmosphereKeys,
	type AtmosphereConnectionDetails,
	type AtmosphereFeedItem,
	type AtmosphereScopedProfile,
	type AtmosphereTagFeedPage,
	type AtmosphereThreadResponse,
	type AtmosphereTimelinePage,
	AtmosphereAuthorFeedPage,
	AtmosphereAuthorProfile,
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
	atmosphereScopedProfileQuery,
	buildPlaceholderStandalonePost,
	createPostMutation,
	followAtmosphereActorMutation,
	nextPendingPostUri,
	removePlaceholder,
	swapPlaceholder,
	unfollowAtmosphereActorMutation,
	useAtmosphereScopedAuthorFeedInfiniteQuery,
	useAtmosphereScopedThreadQuery,
	useAuthorFeedInfiniteQuery,
	useAuthorProfileQuery,
	useConnectionQuery,
	useConnectionsQuery,
	useCreateConnectionMutation,
	useCreateLikeMutation,
	useCreateRepostMutation,
	useDeleteLikeMutation,
	useDeleteRepostMutation,
	useThreadQuery,
	useTimelineInfiniteQuery,
} from '../reader-atmosphere';

const BASE = 'https://public-api.wordpress.com';
function makeWrapper( c: QueryClient ) {
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ c }>{ children }</QueryClientProvider>;
	}
	return Wrapper;
}

function makeFeedItem( overrides: Partial< AtmosphereFeedItem > = {} ): AtmosphereFeedItem {
	return {
		uri: 'at://did:plc:default/app.bsky.feed.post/3kdef',
		cid: 'cid-default',
		author: {
			did: 'did:plc:default',
			handle: 'default.bsky.social',
			display_name: '',
			avatar: null,
		},
		created_at: '2026-04-28T10:00:00Z',
		indexed_at: '2026-04-28T10:00:00Z',
		text: '',
		html: '<p></p>',
		lang: [],
		reply_parent: null,
		reply_root: null,
		reason: null,
		embed: null,
		counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
		bluesky_url: 'https://bsky.app/profile/default.bsky.social/post/3kdef',
		...overrides,
	};
}

describe( 'reader-atmosphere hooks', () => {
	afterEach( () => nock.cleanAll() );

	it( 'useConnectionsQuery returns the list', async () => {
		nock( BASE ).get( '/wpcom/v2/reader/atmosphere/connections' ).reply( 200, { connections: [] } );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useConnectionsQuery(), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
	} );

	it( 'useCreateConnectionMutation invalidates the connections query', async () => {
		nock( BASE )
			.post( '/wpcom/v2/reader/atmosphere/connections' )
			.reply( 200, { connection: { id: 101, handle: 'a', did: 'did:plc:a', avatar: null } } );
		const client = new QueryClient();
		client.setQueryData( readerAtmosphereKeys.connections(), 'old' );
		const spy = jest.spyOn( client, 'invalidateQueries' );
		const { result } = renderHook( () => useCreateConnectionMutation(), {
			wrapper: makeWrapper( client ),
		} );
		await result.current.mutateAsync( { handle: 'a', app_password: 'xxxx' } );
		await waitFor( () => expect( spy ).toHaveBeenCalled() );
	} );

	it( 'useConnectionQuery is disabled when id is null', () => {
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useConnectionQuery( null ), {
			wrapper: makeWrapper( client ),
		} );
		expect( result.current.fetchStatus ).toBe( 'idle' );
	} );

	it( 'useConnectionQuery fetches /connections/:id', async () => {
		nock( BASE )
			.get( '/wpcom/v2/reader/atmosphere/connections/42' )
			.reply( 200, {
				did: 'did:plc:x',
				handle: 'a.bsky.social',
				display_name: 'Alice',
				description: '',
				avatar: 'https://cdn/avatar.png',
				banner: null,
				counts: { followers: 0, follows: 0, posts: 0 },
			} );
		const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
		const { result } = renderHook( () => useConnectionQuery( 42 ), {
			wrapper: makeWrapper( client ),
		} );
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.avatar ).toBe( 'https://cdn/avatar.png' );
	} );

	describe( 'useTimelineInfiniteQuery', () => {
		const PATH = '/wpcom/v2/reader/atmosphere/connections/42/timeline';

		let wrapper: React.FC< { children: React.ReactNode } >;

		// TanStack Query's default `notifyOnChangeProps: 'tracked'` only re-renders
		// when previously-accessed properties change. Production code naturally
		// touches these via JSX/destructuring; renderHook does not. Touching them
		// inside the render callback ensures the observer notifies on later updates.
		const renderTimelineHook = ( connectionId: number ) =>
			renderHook(
				() => {
					const q = useTimelineInfiniteQuery( connectionId );
					void q.data;
					void q.hasNextPage;
					void q.isFetchingNextPage;
					void q.isError;
					void q.error;
					return q;
				},
				{ wrapper }
			);

		beforeEach( () => {
			const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
			wrapper = ( { children } ) => (
				<QueryClientProvider client={ client }>{ children }</QueryClientProvider>
			);
		} );

		afterEach( () => {
			nock.cleanAll();
		} );

		it( 'is disabled when connectionId is 0', async () => {
			const { result } = renderTimelineHook( 0 );
			expect( result.current.fetchStatus ).toBe( 'idle' );
			expect( result.current.data ).toBeUndefined();
		} );

		it( 'fetches the first page on mount', async () => {
			nock( BASE ).get( PATH ).query( {} ).reply( 200, { items: [], cursor: null } );
			const { result } = renderTimelineHook( 42 );
			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
			expect( result.current.data?.pages[ 0 ].items ).toEqual( [] );
		} );

		it( 'paginates via cursor returned by the previous page', async () => {
			nock( BASE ).get( PATH ).query( {} ).reply( 200, { items: [], cursor: 'page-2' } );
			nock( BASE )
				.get( PATH )
				.query( { cursor: 'page-2' } )
				.reply( 200, { items: [], cursor: null } );

			const { result } = renderTimelineHook( 42 );
			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
			expect( result.current.hasNextPage ).toBe( true );

			await act( async () => {
				await result.current.fetchNextPage();
			} );
			expect( result.current.data?.pages.length ).toBe( 2 );
			expect( result.current.hasNextPage ).toBe( false );
		} );

		it( 'surfaces typed errors and recovers via refetch', async () => {
			nock( BASE )
				.get( PATH )
				.query( {} )
				.reply( 502, { error: 'atmosphere_upstream_unavailable', message: 'down' } );
			const { result } = renderTimelineHook( 42 );
			await waitFor( () => expect( result.current.isError ).toBe( true ) );
			expect( result.current.error ).toMatchObject( { kind: 'upstream_unavailable' } );

			nock( BASE ).get( PATH ).query( {} ).reply( 200, { items: [], cursor: null } );
			await act( async () => {
				await result.current.refetch();
			} );
			expect( result.current.isSuccess ).toBe( true );
		} );
	} );

	describe( 'useThreadQuery', () => {
		const FIXTURE_URI = 'at://did:plc:abc/app.bsky.feed.post/3kabc';
		const fixture: AtmosphereThreadResponse = {
			thread: {
				type: 'post',
				post: makeFeedItem( { uri: FIXTURE_URI } ),
				parent: null,
				replies: [],
			},
		};

		it( 'is disabled when uri is empty', () => {
			const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
			const { result } = renderHook( () => useThreadQuery( { uri: '' } ), {
				wrapper: makeWrapper( client ),
			} );
			expect( result.current.isPending ).toBe( true );
			expect( result.current.fetchStatus ).toBe( 'idle' );
		} );

		it( 'fetches the thread once the uri is non-empty', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( { uri: FIXTURE_URI } )
				.reply( 200, fixture );

			const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
			const { result } = renderHook( () => useThreadQuery( { uri: FIXTURE_URI } ), {
				wrapper: makeWrapper( client ),
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
			expect( result.current.data ).toEqual( fixture );
		} );

		it( 'surfaces a typed error and recovers via refetch', async () => {
			// useThreadQuery retries upstream_unavailable up to 2 more times
			// (3 total) before settling into the error state.
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( { uri: FIXTURE_URI } )
				.times( 3 )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const client = new QueryClient( {
				defaultOptions: { queries: { retry: false, retryDelay: 0 } },
			} );
			const { result } = renderHook( () => useThreadQuery( { uri: FIXTURE_URI } ), {
				wrapper: makeWrapper( client ),
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );
			expect( result.current.error ).toMatchObject( { kind: 'upstream_unavailable' } );

			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( { uri: FIXTURE_URI } )
				.reply( 200, fixture );

			await act( async () => {
				await result.current.refetch();
			} );
			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		} );

		it( 'does not retry non-retriable errors (auth_required, not_found, bad_request)', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( { uri: FIXTURE_URI } )
				.reply( 401, { error: 'atmosphere_auth_required' } );

			const client = new QueryClient( {
				defaultOptions: { queries: { retry: false, retryDelay: 0 } },
			} );
			const { result } = renderHook( () => useThreadQuery( { uri: FIXTURE_URI } ), {
				wrapper: makeWrapper( client ),
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );
			expect( result.current.error ).toMatchObject( { kind: 'auth_required' } );
			// If retries had fired, the second .get(...) without a matching
			// interceptor would have thrown a nock unmatched-request error.
			expect( nock.pendingMocks() ).toHaveLength( 0 );
		} );

		it.each( [
			[ 'not_found', 404, 'atmosphere_not_found' ],
			[ 'bad_request', 400, 'atmosphere_bad_request' ],
			[ 'connection_not_found', 404, 'connection_not_found' ],
			[ 'rate_limited', 429, 'atmosphere_rate_limited' ],
		] as const )(
			'does not retry %s — single fetch is enough',
			async ( expectedKind, status, errorCode ) => {
				nock( BASE )
					.get( '/wpcom/v2/reader/atmosphere/thread' )
					.query( { uri: FIXTURE_URI } )
					.reply( status, { error: errorCode, message: 'nope' } );

				const client = new QueryClient( {
					defaultOptions: { queries: { retry: false, retryDelay: 0 } },
				} );
				const { result } = renderHook( () => useThreadQuery( { uri: FIXTURE_URI } ), {
					wrapper: makeWrapper( client ),
				} );

				await waitFor( () => expect( result.current.isError ).toBe( true ) );
				expect( result.current.error ).toMatchObject( { kind: expectedKind } );
				expect( nock.pendingMocks() ).toHaveLength( 0 );
			}
		);
	} );

	describe( 'useConnectionsQuery retry predicate', () => {
		it( 'does not retry connection_not_found', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections' )
				.reply( 404, { error: 'connection_not_found' } );

			const client = new QueryClient( {
				defaultOptions: { queries: { retry: false, retryDelay: 0 } },
			} );
			const { result } = renderHook( () => useConnectionsQuery(), {
				wrapper: makeWrapper( client ),
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );
			expect( result.current.error ).toMatchObject( { kind: 'connection_not_found' } );
			expect( nock.pendingMocks() ).toHaveLength( 0 );
		} );

		it( 'retries unknown errors twice (3 total attempts)', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/connections' )
				.times( 3 )
				.reply( 500, { error: 'unknown' } );

			const client = new QueryClient( {
				defaultOptions: { queries: { retry: false, retryDelay: 0 } },
			} );
			const { result } = renderHook( () => useConnectionsQuery(), {
				wrapper: makeWrapper( client ),
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );
			expect( nock.pendingMocks() ).toHaveLength( 0 );
		} );
	} );

	describe( 'useAuthorProfileQuery', () => {
		it( 'is disabled when actor is empty', () => {
			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );

			renderHook( () => useAuthorProfileQuery( { actor: '' } ), { wrapper } );

			expect( queryClient.isFetching() ).toBe( 0 );
		} );

		it( 'fetches the profile and resolves the typed result', async () => {
			const payload: AtmosphereAuthorProfile = {
				did: 'did:plc:abc',
				handle: 'alice.bsky.social',
				display_name: 'Alice',
				description: '',
				description_html: '',
				avatar: null,
				banner: null,
				bluesky_url: 'https://bsky.app/profile/alice.bsky.social',
				counts: { followers: 0, follows: 0, posts: 0 },
			};
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social' )
				.reply( 200, payload );

			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );
			const { result } = renderHook(
				() => useAuthorProfileQuery( { actor: 'alice.bsky.social' } ),
				{ wrapper }
			);

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
			expect( result.current.data ).toEqual( payload );
		} );

		it( 'recovers via refetch after an error', async () => {
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const queryClient = new QueryClient( {
				defaultOptions: { queries: { retry: false } },
			} );
			const wrapper = makeWrapper( queryClient );
			const { result } = renderHook(
				() => {
					const q = useAuthorProfileQuery( { actor: 'alice.bsky.social' } );
					// Touch props in render so TanStack's tracked-props observer
					// notifies on later transitions (isError -> isSuccess).
					void q.data;
					void q.isError;
					void q.error;
					void q.isSuccess;
					return q;
				},
				{ wrapper }
			);
			await waitFor( () => expect( result.current.isError ).toBe( true ) );
			expect( result.current.error ).toMatchObject( { kind: 'upstream_unavailable' } );

			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social' )
				.reply( 200, { did: 'did:plc:abc', handle: 'alice.bsky.social' } );
			await result.current.refetch();
			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		} );
	} );

	describe( 'useAuthorFeedInfiniteQuery', () => {
		it( 'is disabled when actor is empty', () => {
			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );

			renderHook( () => useAuthorFeedInfiniteQuery( { actor: '' } ), { wrapper } );

			expect( queryClient.isFetching() ).toBe( 0 );
		} );

		it( 'resolves the first page', async () => {
			const page: AtmosphereAuthorFeedPage = { items: [], cursor: 'next' };
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.reply( 200, page );

			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );
			const { result } = renderHook(
				() => {
					const q = useAuthorFeedInfiniteQuery( { actor: 'alice.bsky.social' } );
					void q.data;
					void q.isError;
					void q.error;
					void q.isSuccess;
					return q;
				},
				{ wrapper }
			);

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
			expect( result.current.data?.pages[ 0 ] ).toEqual( page );
		} );

		it( 'advances the cursor on fetchNextPage', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.reply( 200, { items: [], cursor: 'page-2' } );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.query( { cursor: 'page-2' } )
				.reply( 200, { items: [], cursor: null } );

			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );
			const { result } = renderHook(
				() => {
					const q = useAuthorFeedInfiniteQuery( { actor: 'alice.bsky.social' } );
					void q.data;
					void q.hasNextPage;
					void q.isFetchingNextPage;
					void q.isError;
					void q.error;
					void q.isSuccess;
					return q;
				},
				{ wrapper }
			);

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
			await result.current.fetchNextPage();
			await waitFor( () => expect( result.current.data?.pages.length ).toBe( 2 ) );
			expect( result.current.hasNextPage ).toBe( false );
		} );

		it( 'forwards filter to the fetcher when set', async () => {
			const scope = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.query( { filter: 'posts_with_media' } )
				.reply( 200, { items: [], cursor: null } );

			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );
			const { result } = renderHook(
				() => {
					const q = useAuthorFeedInfiniteQuery( {
						actor: 'alice.bsky.social',
						filter: 'posts_with_media',
					} );
					void q.data;
					void q.isError;
					void q.error;
					void q.isSuccess;
					return q;
				},
				{ wrapper }
			);

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
			expect( scope.isDone() ).toBe( true );
		} );

		it( 'treats filter=posts_no_replies the same as no filter (default normalization)', async () => {
			const scope = nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.query( ( q ) => ! ( 'filter' in q ) )
				.reply( 200, { items: [], cursor: null } );

			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );
			const { result } = renderHook(
				() => {
					const q = useAuthorFeedInfiniteQuery( {
						actor: 'alice.bsky.social',
						filter: 'posts_no_replies',
					} );
					void q.data;
					void q.isError;
					void q.error;
					void q.isSuccess;
					return q;
				},
				{ wrapper }
			);

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
			expect( scope.isDone() ).toBe( true );

			// And the cache key should match the slice-6 4-element shape, not 5-element.
			const cacheKey = queryClient.getQueryCache().getAll()[ 0 ]?.queryKey;
			expect( cacheKey ).toEqual( [ 'reader', 'atmosphere', 'author-feed', 'alice.bsky.social' ] );
		} );

		it( 'caches results independently per filter value', async () => {
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.query( ( q ) => ! ( 'filter' in q ) )
				.reply( 200, { items: [], cursor: null } );
			nock( 'https://public-api.wordpress.com' )
				.get( '/wpcom/v2/reader/atmosphere/profile/alice.bsky.social/feed' )
				.query( { filter: 'posts_with_replies' } )
				.reply( 200, { items: [], cursor: null } );

			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );

			const { result: noFilter } = renderHook(
				() => {
					const q = useAuthorFeedInfiniteQuery( { actor: 'alice.bsky.social' } );
					void q.data;
					void q.isError;
					void q.error;
					void q.isSuccess;
					return q;
				},
				{ wrapper }
			);
			await waitFor( () => expect( noFilter.current.isSuccess ).toBe( true ) );

			const { result: withFilter } = renderHook(
				() => {
					const q = useAuthorFeedInfiniteQuery( {
						actor: 'alice.bsky.social',
						filter: 'posts_with_replies',
					} );
					void q.data;
					void q.isError;
					void q.error;
					void q.isSuccess;
					return q;
				},
				{ wrapper }
			);
			await waitFor( () => expect( withFilter.current.isSuccess ).toBe( true ) );

			// Both queries resolved independently — the cache key includes filter,
			// so the second hook did not reuse the first hook's data.
			const matched = queryClient.getQueryCache().findAll( {
				queryKey: readerAtmosphereKeys.authorFeed( 'alice.bsky.social' ),
			} );
			expect( matched ).toHaveLength( 2 );
		} );
	} );

	describe( 'useAtmosphereScopedThreadQuery', () => {
		it( 'is disabled when connectionId is 0', () => {
			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );

			renderHook(
				() =>
					useAtmosphereScopedThreadQuery( {
						connectionId: 0,
						uri: 'at://did:plc:abc/app.bsky.feed.post/3kabc',
					} ),
				{ wrapper }
			);

			expect( queryClient.isFetching() ).toBe( 0 );
		} );
	} );

	describe( 'useAtmosphereScopedAuthorFeedInfiniteQuery', () => {
		it( 'is disabled when connectionId is 0', () => {
			const queryClient = new QueryClient();
			const wrapper = makeWrapper( queryClient );

			renderHook(
				() =>
					useAtmosphereScopedAuthorFeedInfiniteQuery( {
						connectionId: 0,
						actor: 'alice.bsky.social',
					} ),
				{ wrapper }
			);

			expect( queryClient.isFetching() ).toBe( 0 );
		} );
	} );

	describe( 'follow / unfollow mutations', () => {
		function makeScopedProfile(
			overrides: Partial< AtmosphereScopedProfile > = {}
		): AtmosphereScopedProfile {
			return {
				did: 'did:plc:target',
				handle: 'alice.bsky.social',
				display_name: 'Alice',
				description: '',
				description_html: '',
				avatar: null,
				banner: null,
				bluesky_url: 'https://bsky.app/profile/alice.bsky.social',
				counts: { followers: 0, follows: 0, posts: 0 },
				viewer: {
					following: null,
					following_rkey: null,
					followed_by: false,
				},
				...overrides,
			};
		}

		it( 'followAtmosphereActorMutation optimistically marks following and confirms on success', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = atmosphereScopedProfileQuery( {
				connectionId: 1,
				actor: 'alice.bsky.social',
			} ).queryKey;
			client.setQueryData( key, makeScopedProfile() );

			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/1/follows' )
				.reply( 201, {
					follow: {
						uri: 'at://did:plc:caller/app.bsky.graph.follow/3krkeyrkeyrke',
						cid: 'bafy',
						rkey: '3krkeyrkeyrke',
					},
				} );

			const { result } = renderHook( () => useMutation( followAtmosphereActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice.bsky.social',
					subjectDid: 'did:plc:target',
				} );
			} );

			const updated = client.getQueryData< AtmosphereScopedProfile >( key );
			expect( updated?.viewer.following ).toBe(
				'at://did:plc:caller/app.bsky.graph.follow/3krkeyrkeyrke'
			);
			expect( updated?.viewer.following_rkey ).toBe( '3krkeyrkeyrke' );
		} );

		it( 'followAtmosphereActorMutation rolls back on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = atmosphereScopedProfileQuery( {
				connectionId: 1,
				actor: 'alice.bsky.social',
			} ).queryKey;
			const original = makeScopedProfile();
			client.setQueryData( key, original );

			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/1/follows' )
				.reply( 502, { code: 'atmosphere_upstream_unavailable', message: 'Bluesky unreachable.' } );

			const { result } = renderHook( () => useMutation( followAtmosphereActorMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId: 1,
						actor: 'alice.bsky.social',
						subjectDid: 'did:plc:target',
					} );
				} catch {
					// expected
				}
			} );

			const after = client.getQueryData< AtmosphereScopedProfile >( key );
			expect( after?.viewer.following ).toBeNull();
			expect( after?.viewer.following_rkey ).toBeNull();
		} );

		it( 'unfollowAtmosphereActorMutation optimistically clears following and stays cleared on success', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = atmosphereScopedProfileQuery( {
				connectionId: 1,
				actor: 'alice.bsky.social',
			} ).queryKey;
			client.setQueryData(
				key,
				makeScopedProfile( {
					viewer: {
						following: 'at://did:plc:caller/app.bsky.graph.follow/3krkeyrkeyrke',
						following_rkey: '3krkeyrkeyrke',
						followed_by: false,
					},
				} )
			);

			// deleteFollow uses wpcom.req.post({ ..., method: 'DELETE' }), which
			// the wpcom client resolves to a real HTTP DELETE — intercept DELETE.
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/1/follows/3krkeyrkeyrke' )
				.reply( 204 );

			const { result } = renderHook(
				() => useMutation( unfollowAtmosphereActorMutation( client ) ),
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId: 1,
					actor: 'alice.bsky.social',
					rkey: '3krkeyrkeyrke',
				} );
			} );

			const after = client.getQueryData< AtmosphereScopedProfile >( key );
			expect( after?.viewer.following ).toBeNull();
			expect( after?.viewer.following_rkey ).toBeNull();
		} );

		it( 'unfollowAtmosphereActorMutation rolls back on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const key = atmosphereScopedProfileQuery( {
				connectionId: 1,
				actor: 'alice.bsky.social',
			} ).queryKey;
			const original = makeScopedProfile( {
				viewer: {
					following: 'at://did:plc:caller/app.bsky.graph.follow/3krkeyrkeyrke',
					following_rkey: '3krkeyrkeyrke',
					followed_by: true,
				},
			} );
			client.setQueryData( key, original );

			// Same real-DELETE wire shape as the success case above, but replies 502.
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/1/follows/3krkeyrkeyrke' )
				.reply( 502, { code: 'atmosphere_upstream_unavailable', message: 'Bluesky unreachable.' } );

			const { result } = renderHook(
				() => useMutation( unfollowAtmosphereActorMutation( client ) ),
				{ wrapper: makeWrapper( client ) }
			);

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId: 1,
						actor: 'alice.bsky.social',
						rkey: '3krkeyrkeyrke',
					} );
				} catch {
					// expected
				}
			} );

			const after = client.getQueryData< AtmosphereScopedProfile >( key );
			expect( after?.viewer.following ).toBe(
				'at://did:plc:caller/app.bsky.graph.follow/3krkeyrkeyrke'
			);
			expect( after?.viewer.following_rkey ).toBe( '3krkeyrkeyrke' );
			expect( after?.viewer.followed_by ).toBe( true );
		} );
	} );

	describe( 'useCreateLikeMutation / useDeleteLikeMutation', () => {
		const CONNECTION_ID = 42;
		const TARGET_URI = 'at://did:plc:target/app.bsky.feed.post/3ktarget';
		const TARGET_CID = 'cid-target';
		const OTHER_URI = 'at://did:plc:other/app.bsky.feed.post/3kother';
		const SERVER_LIKE_URI = 'at://did:plc:viewer/app.bsky.feed.like/3krkeyrkeyrke';
		const SERVER_LIKE_RKEY = '3krkeyrkeyrke';

		function makeFeedItemWithViewer(
			overrides: Partial< AtmosphereFeedItem > = {}
		): AtmosphereFeedItem {
			return makeFeedItem( {
				viewer: { like: null, repost: null },
				...overrides,
			} );
		}

		function seedTimeline(
			client: QueryClient,
			pages: AtmosphereTimelinePage[],
			pageParams: ( string | undefined )[]
		) {
			const data: InfiniteData< AtmosphereTimelinePage > = { pages, pageParams };
			client.setQueryData( readerAtmosphereKeys.timeline( CONNECTION_ID ), data );
		}

		function getTimelineCache( client: QueryClient ) {
			return client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
				readerAtmosphereKeys.timeline( CONNECTION_ID )
			);
		}

		function seedAuthorFeed(
			client: QueryClient,
			pages: AtmosphereAuthorFeedPage[],
			pageParams: ( string | undefined )[]
		) {
			const data: InfiniteData< AtmosphereAuthorFeedPage > = { pages, pageParams };
			client.setQueryData( readerAtmosphereKeys.authorFeed( 'alice.bsky.social' ), data );
		}

		function getAuthorFeedCache( client: QueryClient ) {
			return client.getQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
				readerAtmosphereKeys.authorFeed( 'alice.bsky.social' )
			);
		}

		function seedTagFeed(
			client: QueryClient,
			pages: AtmosphereTagFeedPage[],
			pageParams: ( string | undefined )[]
		) {
			const data: InfiniteData< AtmosphereTagFeedPage > = { pages, pageParams };
			client.setQueryData( readerAtmosphereKeys.tagFeed( CONNECTION_ID, 'rust' ), data );
		}

		function getTagFeedCache( client: QueryClient ) {
			return client.getQueryData< InfiniteData< AtmosphereTagFeedPage > >(
				readerAtmosphereKeys.tagFeed( CONNECTION_ID, 'rust' )
			);
		}

		function seedThread( client: QueryClient, thread: AtmosphereThreadResponse ) {
			client.setQueryData( readerAtmosphereKeys.thread( TARGET_URI ), thread );
		}

		function getThreadCache( client: QueryClient ) {
			return client.getQueryData< AtmosphereThreadResponse >(
				readerAtmosphereKeys.thread( TARGET_URI )
			);
		}

		describe( 'useCreateLikeMutation', () => {
			it( 'optimistically sets PENDING_LIKE_URI + increments likes; replaces with real URI on success', async () => {
				const target = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
				} );
				const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
				const cancelQueriesSpy = jest.spyOn( client, 'cancelQueries' );
				seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );

				nock( BASE )
					.post( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes`, {
						post_uri: TARGET_URI,
						post_cid: TARGET_CID,
					} )
					.delay( 100 )
					.reply( 200, {
						like: { uri: SERVER_LIKE_URI, cid: 'cid-like', rkey: SERVER_LIKE_RKEY },
					} );

				const { result } = renderHook(
					() => {
						const m = useCreateLikeMutation( CONNECTION_ID );
						void m.isPending;
						void m.isSuccess;
						void m.isError;
						void m.data;
						return m;
					},
					{ wrapper: makeWrapper( client ) }
				);

				await act( async () => {
					result.current.mutate( { postUri: TARGET_URI, postCid: TARGET_CID } );
					await Promise.resolve();
				} );

				await waitFor( () => {
					const optimistic = getTimelineCache( client );
					expect( optimistic?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe( PENDING_LIKE_URI );
					expect( optimistic?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 6 );
				} );
				expect( cancelQueriesSpy ).toHaveBeenCalledWith( {
					queryKey: readerAtmosphereKeys.all,
				} );

				await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

				const settled = getTimelineCache( client );
				expect( settled?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe( SERVER_LIKE_URI );
				expect( settled?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 6 );
			} );

			it( 'rolls back to the pre-mutation snapshot on error', async () => {
				const target = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					counts: { replies: 1, reposts: 2, likes: 7, quotes: 3 },
				} );
				const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
				seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
				const snapshot = getTimelineCache( client );

				nock( BASE )
					.post( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes` )
					.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

				const { result } = renderHook(
					() => {
						const m = useCreateLikeMutation( CONNECTION_ID );
						void m.isPending;
						void m.isError;
						void m.error;
						return m;
					},
					{ wrapper: makeWrapper( client ) }
				);

				await act( async () => {
					result.current.mutate( { postUri: TARGET_URI, postCid: TARGET_CID } );
					await Promise.resolve();
				} );

				await waitFor( () => expect( result.current.isError ).toBe( true ) );

				expect( getTimelineCache( client ) ).toEqual( snapshot );
			} );

			it( 'does not roll back another pending like when one request fails', async () => {
				const otherLikeUri = 'at://did:plc:viewer/app.bsky.feed.like/3kotherlike';
				const target = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					counts: { replies: 0, reposts: 0, likes: 1, quotes: 0 },
				} );
				const otherPost = makeFeedItemWithViewer( {
					uri: OTHER_URI,
					cid: 'cid-other',
					counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
				} );
				const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
				seedTimeline( client, [ { items: [ target, otherPost ], cursor: null } ], [ undefined ] );

				nock( BASE )
					.post( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes`, {
						post_uri: TARGET_URI,
						post_cid: TARGET_CID,
					} )
					.delay( 100 )
					.reply( 502, { error: 'atmosphere_upstream_unavailable' } );
				nock( BASE )
					.post( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes`, {
						post_uri: OTHER_URI,
						post_cid: 'cid-other',
					} )
					.reply( 200, {
						like: { uri: otherLikeUri, cid: 'cid-like-other', rkey: '3kotherlike' },
					} );

				const { result } = renderHook(
					() => {
						const m = useCreateLikeMutation( CONNECTION_ID );
						void m.isPending;
						void m.isSuccess;
						void m.isError;
						return m;
					},
					{ wrapper: makeWrapper( client ) }
				);

				let failedMutation: Promise< unknown > = Promise.resolve();
				let successfulMutation: Promise< unknown > = Promise.resolve();
				await act( async () => {
					failedMutation = result.current
						.mutateAsync( { postUri: TARGET_URI, postCid: TARGET_CID } )
						.catch( () => undefined );
					successfulMutation = result.current.mutateAsync( {
						postUri: OTHER_URI,
						postCid: 'cid-other',
					} );
					await Promise.resolve();
				} );

				await waitFor( () => {
					const optimistic = getTimelineCache( client );
					expect( optimistic?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe( PENDING_LIKE_URI );
					expect( optimistic?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 2 );
					expect( optimistic?.pages[ 0 ].items[ 1 ].viewer?.like ).toBe( PENDING_LIKE_URI );
					expect( optimistic?.pages[ 0 ].items[ 1 ].counts.likes ).toBe( 6 );
				} );

				await act( async () => {
					await Promise.all( [ failedMutation, successfulMutation ] );
				} );

				const settled = getTimelineCache( client );
				expect( settled?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe( null );
				expect( settled?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 1 );
				expect( settled?.pages[ 0 ].items[ 1 ].viewer?.like ).toBe( otherLikeUri );
				expect( settled?.pages[ 0 ].items[ 1 ].counts.likes ).toBe( 6 );
			} );

			it( 'rolls back by post URI when cache order changes before an error settles', async () => {
				const target = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					counts: { replies: 0, reposts: 0, likes: 1, quotes: 0 },
				} );
				const otherPost = makeFeedItemWithViewer( {
					uri: OTHER_URI,
					cid: 'cid-other',
					counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
				} );
				const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
				seedTimeline( client, [ { items: [ target, otherPost ], cursor: null } ], [ undefined ] );

				nock( BASE )
					.post( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes` )
					.delay( 100 )
					.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

				const { result } = renderHook(
					() => {
						const m = useCreateLikeMutation( CONNECTION_ID );
						void m.isPending;
						void m.isError;
						void m.error;
						return m;
					},
					{ wrapper: makeWrapper( client ) }
				);

				await act( async () => {
					result.current.mutate( { postUri: TARGET_URI, postCid: TARGET_CID } );
					await Promise.resolve();
				} );

				await waitFor( () => {
					expect( getTimelineCache( client )?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe(
						PENDING_LIKE_URI
					);
				} );

				const optimistic = getTimelineCache( client );
				if ( ! optimistic ) {
					throw new Error( 'expected optimistic timeline cache' );
				}
				client.setQueryData( readerAtmosphereKeys.timeline( CONNECTION_ID ), {
					...optimistic,
					pages: [
						{
							...optimistic.pages[ 0 ],
							items: [ optimistic.pages[ 0 ].items[ 1 ], optimistic.pages[ 0 ].items[ 0 ] ],
						},
					],
				} );

				await waitFor( () => expect( result.current.isError ).toBe( true ) );

				const settled = getTimelineCache( client );
				expect( settled?.pages[ 0 ].items[ 0 ].uri ).toBe( OTHER_URI );
				expect( settled?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe( null );
				expect( settled?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 5 );
				expect( settled?.pages[ 0 ].items[ 1 ].uri ).toBe( TARGET_URI );
				expect( settled?.pages[ 0 ].items[ 1 ].viewer?.like ).toBe( null );
				expect( settled?.pages[ 0 ].items[ 1 ].counts.likes ).toBe( 1 );
			} );

			it( 'preserves reordered duplicate post occurrences when rolling back by URI', async () => {
				const firstOccurrence = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					counts: { replies: 0, reposts: 0, likes: 1, quotes: 0 },
				} );
				const secondOccurrence = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					counts: { replies: 0, reposts: 0, likes: 10, quotes: 0 },
					reason: {
						type: 'repost',
						by: {
							did: 'did:plc:reposter',
							handle: 'reposter.bsky.social',
							display_name: 'Reposter',
						},
					},
				} );
				const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
				seedTimeline(
					client,
					[ { items: [ firstOccurrence, secondOccurrence ], cursor: null } ],
					[ undefined ]
				);

				nock( BASE )
					.post( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes` )
					.delay( 100 )
					.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

				const { result } = renderHook(
					() => {
						const m = useCreateLikeMutation( CONNECTION_ID );
						void m.isPending;
						void m.isError;
						void m.error;
						return m;
					},
					{ wrapper: makeWrapper( client ) }
				);

				await act( async () => {
					result.current.mutate( { postUri: TARGET_URI, postCid: TARGET_CID } );
					await Promise.resolve();
				} );

				await waitFor( () => {
					const optimistic = getTimelineCache( client );
					expect( optimistic?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 2 );
					expect( optimistic?.pages[ 0 ].items[ 1 ].counts.likes ).toBe( 11 );
				} );

				const optimistic = getTimelineCache( client );
				if ( ! optimistic ) {
					throw new Error( 'expected optimistic timeline cache' );
				}
				client.setQueryData( readerAtmosphereKeys.timeline( CONNECTION_ID ), {
					...optimistic,
					pages: [
						{
							...optimistic.pages[ 0 ],
							items: [ optimistic.pages[ 0 ].items[ 1 ], optimistic.pages[ 0 ].items[ 0 ] ],
						},
					],
				} );

				await waitFor( () => expect( result.current.isError ).toBe( true ) );

				const settled = getTimelineCache( client );
				expect( settled?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 10 );
				expect( settled?.pages[ 0 ].items[ 0 ].reason?.by.handle ).toBe( 'reposter.bsky.social' );
				expect( settled?.pages[ 0 ].items[ 1 ].counts.likes ).toBe( 1 );
				expect( settled?.pages[ 0 ].items[ 1 ].reason ).toBeNull();
			} );

			it( 'patches only the matching post across multiple pages', async () => {
				const otherPost = makeFeedItemWithViewer( {
					uri: OTHER_URI,
					cid: 'cid-other',
					counts: { replies: 0, reposts: 0, likes: 1, quotes: 0 },
				} );
				const target = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
				} );
				const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
				seedTimeline(
					client,
					[
						{ items: [ otherPost ], cursor: 'p2' },
						{ items: [ target ], cursor: null },
					],
					[ undefined, 'p2' ]
				);

				nock( BASE )
					.post( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes` )
					.reply( 200, {
						like: { uri: SERVER_LIKE_URI, cid: 'cid-like', rkey: SERVER_LIKE_RKEY },
					} );

				const { result } = renderHook(
					() => {
						const m = useCreateLikeMutation( CONNECTION_ID );
						void m.isPending;
						void m.isSuccess;
						return m;
					},
					{ wrapper: makeWrapper( client ) }
				);

				await act( async () => {
					result.current.mutate( { postUri: TARGET_URI, postCid: TARGET_CID } );
					await Promise.resolve();
				} );

				await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

				const settled = getTimelineCache( client );
				expect( settled?.pages ).toHaveLength( 2 );
				// Page 1 (other post) untouched.
				expect( settled?.pages[ 0 ].items[ 0 ].uri ).toBe( OTHER_URI );
				expect( settled?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe( null );
				expect( settled?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 1 );
				// Page 2 (target) updated with the real URI + incremented count.
				expect( settled?.pages[ 1 ].items[ 0 ].uri ).toBe( TARGET_URI );
				expect( settled?.pages[ 1 ].items[ 0 ].viewer?.like ).toBe( SERVER_LIKE_URI );
				expect( settled?.pages[ 1 ].items[ 0 ].counts.likes ).toBe( 6 );
			} );

			it( 'patches matching posts across timeline, profile, tag, and thread caches', async () => {
				const target = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
				} );
				const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
				seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
				seedAuthorFeed( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
				seedTagFeed(
					client,
					[ { items: [ target ], cursor: null, tag: { name: 'rust', count: 1 } } ],
					[ undefined ]
				);
				seedThread( client, {
					thread: { type: 'post', post: target, parent: null, replies: [] },
				} );

				nock( BASE )
					.post( `/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes` )
					.reply( 200, {
						like: { uri: SERVER_LIKE_URI, cid: 'cid-like', rkey: SERVER_LIKE_RKEY },
					} );

				const { result } = renderHook(
					() => {
						const m = useCreateLikeMutation( CONNECTION_ID );
						void m.isSuccess;
						return m;
					},
					{ wrapper: makeWrapper( client ) }
				);

				await act( async () => {
					result.current.mutate( { postUri: TARGET_URI, postCid: TARGET_CID } );
					await Promise.resolve();
				} );

				await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

				expect( getTimelineCache( client )?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe(
					SERVER_LIKE_URI
				);
				expect( getAuthorFeedCache( client )?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe(
					SERVER_LIKE_URI
				);
				expect( getTagFeedCache( client )?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe(
					SERVER_LIKE_URI
				);
				const thread = getThreadCache( client )?.thread;
				expect( thread?.type ).toBe( 'post' );
				expect( thread?.type === 'post' ? thread.post.viewer?.like : null ).toBe( SERVER_LIKE_URI );
			} );
		} );

		describe( 'useDeleteLikeMutation', () => {
			it( 'optimistically clears viewer.like and decrements likes', async () => {
				const target = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					viewer: { like: SERVER_LIKE_URI, repost: null },
					counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
				} );
				const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
				seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );

				nock( BASE )
					.delete(
						`/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes/${ SERVER_LIKE_RKEY }`
					)
					.delay( 100 )
					.reply( 200, {} );

				const { result } = renderHook(
					() => {
						const m = useDeleteLikeMutation( CONNECTION_ID );
						void m.isPending;
						void m.isSuccess;
						return m;
					},
					{ wrapper: makeWrapper( client ) }
				);

				await act( async () => {
					result.current.mutate( { rkey: SERVER_LIKE_RKEY, postUri: TARGET_URI } );
					await Promise.resolve();
				} );

				await waitFor( () => {
					const optimistic = getTimelineCache( client );
					expect( optimistic?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe( null );
					expect( optimistic?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 4 );
				} );

				await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

				const settled = getTimelineCache( client );
				expect( settled?.pages[ 0 ].items[ 0 ].viewer?.like ).toBe( null );
				expect( settled?.pages[ 0 ].items[ 0 ].counts.likes ).toBe( 4 );
			} );

			it( 'rolls back to the pre-mutation snapshot on error', async () => {
				const target = makeFeedItemWithViewer( {
					uri: TARGET_URI,
					cid: TARGET_CID,
					viewer: { like: SERVER_LIKE_URI, repost: null },
					counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
				} );
				const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
				seedTimeline( client, [ { items: [ target ], cursor: null } ], [ undefined ] );
				const snapshot = getTimelineCache( client );

				nock( BASE )
					.delete(
						`/wpcom/v2/reader/atmosphere/connections/${ CONNECTION_ID }/likes/${ SERVER_LIKE_RKEY }`
					)
					.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

				const { result } = renderHook(
					() => {
						const m = useDeleteLikeMutation( CONNECTION_ID );
						void m.isPending;
						void m.isError;
						void m.error;
						return m;
					},
					{ wrapper: makeWrapper( client ) }
				);

				await act( async () => {
					result.current.mutate( { rkey: SERVER_LIKE_RKEY, postUri: TARGET_URI } );
					await Promise.resolve();
				} );

				await waitFor( () => expect( result.current.isError ).toBe( true ) );

				expect( getTimelineCache( client ) ).toEqual( snapshot );
			} );
		} );
	} );

	describe( 'createPostMutation — reply mode', () => {
		const connectionId = 42;
		const root = { uri: 'at://did:plc:r/app.bsky.feed.post/root', cid: 'rcid' };
		const parent = { uri: 'at://did:plc:p/app.bsky.feed.post/parent', cid: 'pcid' };

		afterEach( () => nock.cleanAll() );

		function seedThreadWithParent( client: QueryClient ): AtmosphereThreadResponse {
			const initial: AtmosphereThreadResponse = {
				thread: {
					type: 'post',
					post: makeFeedItem( {
						uri: root.uri,
						cid: root.cid,
						counts: { replies: 1, reposts: 0, likes: 0, quotes: 0 },
					} ),
					parent: null,
					replies: [
						{
							type: 'post',
							post: makeFeedItem( {
								uri: parent.uri,
								cid: parent.cid,
								counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
							} ),
							parent: null,
							replies: [],
						},
					],
				},
			};
			client.setQueryData( readerAtmosphereKeys.thread( root.uri ), initial );
			return initial;
		}

		it( 'POSTs the body and returns the new post reference', async () => {
			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts`, {
					text: 'hello',
					reply: { root, parent },
				} )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId,
					text: 'hello',
					reply: { root, parent },
				} );
			} );

			expect( result.current.data ).toEqual( { uri: 'at://new', cid: 'newcid', rkey: 'abc' } );
		} );

		it( 'optimistically inserts a placeholder reply under the parent in the thread query', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedThreadWithParent( client );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 100 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( {
					connectionId,
					text: 'reply text',
					reply: { root, parent },
				} );
				await Promise.resolve();
			} );

			await waitFor( () => {
				const thread = client.getQueryData< AtmosphereThreadResponse >(
					readerAtmosphereKeys.thread( root.uri )
				);
				expect( thread?.thread.type ).toBe( 'post' );
				if ( thread?.thread.type !== 'post' ) {
					throw new Error( 'expected root to be a post node' );
				}
				expect( thread.thread.replies ).toHaveLength( 1 );
				const parentNode = thread.thread.replies[ 0 ];
				expect( parentNode.type ).toBe( 'post' );
				if ( parentNode.type !== 'post' ) {
					throw new Error( 'expected parent to be a post node' );
				}
				expect( parentNode.replies ).toHaveLength( 1 );
				const placeholder = parentNode.replies[ 0 ];
				expect( placeholder.type ).toBe( 'post' );
				if ( placeholder.type !== 'post' ) {
					throw new Error( 'expected placeholder to be a post node' );
				}
				// Each in-flight reply is stamped with a unique
				// `${PENDING_REPLY_URI}#<n>` suffix so concurrent replies
				// can't collide on rewrite. Match on the prefix.
				expect( placeholder.post.uri.startsWith( PENDING_REPLY_URI ) ).toBe( true );
				expect( placeholder.post.text ).toBe( 'reply text' );
			} );

			await promise;
		} );

		it( 'hydrates the placeholder author from the cached connection', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedThreadWithParent( client );
			client.setQueryData( readerAtmosphereKeys.connection( connectionId ), {
				did: 'did:plc:me',
				handle: 'me.bsky.social',
				display_name: 'Me',
				description: '',
				avatar: 'https://cdn.bsky.app/me/avatar.jpg',
				banner: null,
				counts: { followers: 0, follows: 0, posts: 0 },
			} );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 50 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( {
					connectionId,
					text: 'reply text',
					reply: { root, parent },
				} );
				await Promise.resolve();
			} );

			// Optimistic placeholder carries the connection's author.
			await waitFor( () => {
				const thread = client.getQueryData< AtmosphereThreadResponse >(
					readerAtmosphereKeys.thread( root.uri )
				);
				if ( thread?.thread.type !== 'post' ) {
					throw new Error( 'expected root to be a post node' );
				}
				const parentNode = thread.thread.replies[ 0 ];
				if ( parentNode.type !== 'post' ) {
					throw new Error( 'expected parent to be a post node' );
				}
				const placeholder = parentNode.replies[ 0 ];
				if ( placeholder.type !== 'post' ) {
					throw new Error( 'expected placeholder to be a post node' );
				}
				expect( placeholder.post.author ).toEqual( {
					did: 'did:plc:me',
					handle: 'me.bsky.social',
					display_name: 'Me',
					avatar: 'https://cdn.bsky.app/me/avatar.jpg',
				} );
			} );

			await promise;

			// After onSuccess the rewrite carries the same author through.
			const settled = client.getQueryData< AtmosphereThreadResponse >(
				readerAtmosphereKeys.thread( root.uri )
			);
			if ( settled?.thread.type !== 'post' ) {
				throw new Error( 'expected root to be a post node' );
			}
			const settledParent = settled.thread.replies[ 0 ];
			if ( settledParent.type !== 'post' ) {
				throw new Error( 'expected parent to be a post node' );
			}
			const settledReply = settledParent.replies[ 0 ];
			if ( settledReply.type !== 'post' ) {
				throw new Error( 'expected reply to be a post node' );
			}
			expect( settledReply.post.uri ).toBe( 'at://new' );
			expect( settledReply.post.cid ).toBe( 'newcid' );
			expect( settledReply.post.author ).toEqual( {
				did: 'did:plc:me',
				handle: 'me.bsky.social',
				display_name: 'Me',
				avatar: 'https://cdn.bsky.app/me/avatar.jpg',
			} );
		} );

		it( 'fills the placeholder author on success when the connection cache populates after onMutate', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedThreadWithParent( client );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 50 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( {
					connectionId,
					text: 'reply text',
					reply: { root, parent },
				} );
				await Promise.resolve();
			} );

			// Connection cache lands while the request is in flight (e.g. a
			// deep-link path where the shell hydrates the connection
			// query after the user has already opened the composer).
			client.setQueryData( readerAtmosphereKeys.connection( connectionId ), {
				did: 'did:plc:me',
				handle: 'me.bsky.social',
				display_name: 'Me',
				description: '',
				avatar: null,
				banner: null,
				counts: { followers: 0, follows: 0, posts: 0 },
			} );

			await promise;

			const settled = client.getQueryData< AtmosphereThreadResponse >(
				readerAtmosphereKeys.thread( root.uri )
			);
			if ( settled?.thread.type !== 'post' ) {
				throw new Error( 'expected root to be a post node' );
			}
			const settledParent = settled.thread.replies[ 0 ];
			if ( settledParent.type !== 'post' ) {
				throw new Error( 'expected parent to be a post node' );
			}
			const settledReply = settledParent.replies[ 0 ];
			if ( settledReply.type !== 'post' ) {
				throw new Error( 'expected reply to be a post node' );
			}
			expect( settledReply.post.author ).toEqual( {
				did: 'did:plc:me',
				handle: 'me.bsky.social',
				display_name: 'Me',
				avatar: null,
			} );
		} );

		it( 'restores the snapshot on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const initial = seedThreadWithParent( client );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( {
						connectionId,
						text: 'reply text',
						reply: { root, parent },
					} );
				} catch {
					/* expected */
				}
			} );

			expect(
				client.getQueryData< AtmosphereThreadResponse >( readerAtmosphereKeys.thread( root.uri ) )
			).toEqual( initial );
		} );

		it( 'increments parent counts.replies in cached timeline pages', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const parentItem = makeFeedItem( {
				uri: parent.uri,
				cid: parent.cid,
				counts: { replies: 3, reposts: 0, likes: 0, quotes: 0 },
			} );
			const timelineData: InfiniteData< AtmosphereTimelinePage > = {
				pages: [ { items: [ parentItem ], cursor: null } ],
				pageParams: [ undefined ],
			};
			client.setQueryData( readerAtmosphereKeys.timeline( connectionId ), timelineData );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( {
					connectionId,
					text: 'reply text',
					reply: { root, parent },
				} );
			} );

			const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
				readerAtmosphereKeys.timeline( connectionId )
			);
			expect( timeline?.pages[ 0 ].items[ 0 ].counts.replies ).toBe( 4 );
		} );

		it( 'invalidates the thread query when the cache was evicted between onMutate and onSuccess', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedThreadWithParent( client );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 30 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( {
					connectionId,
					text: 'reply text',
					reply: { root, parent },
				} );
				await Promise.resolve();
			} );

			// Evict the thread cache while the request is in flight, simulating
			// a route change / gc / removeQueries between onMutate and onSuccess.
			client.removeQueries( { queryKey: readerAtmosphereKeys.thread( root.uri ) } );

			await promise;

			// onSuccess should have asked the cache to invalidate the thread key
			// so the user's reply is fetched fresh next time the thread loads.
			expect(
				invalidateSpy.mock.calls.some( ( [ filters ] ) => {
					const queryKey = ( filters as { queryKey?: readonly unknown[] } )?.queryKey;
					return (
						Array.isArray( queryKey ) &&
						JSON.stringify( queryKey ) === JSON.stringify( readerAtmosphereKeys.thread( root.uri ) )
					);
				} )
			).toBe( true );
		} );

		it( 'invalidates the thread query when the placeholder is no longer in the tree on success', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedThreadWithParent( client );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 30 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( {
					connectionId,
					text: 'reply text',
					reply: { root, parent },
				} );
				await Promise.resolve();
			} );

			// Simulate a concurrent refetch that drops the placeholder branch
			// while the request is still in flight: re-seed the thread cache
			// without the optimistic placeholder.
			seedThreadWithParent( client );

			await promise;

			expect(
				invalidateSpy.mock.calls.some( ( [ filters ] ) => {
					const queryKey = ( filters as { queryKey?: readonly unknown[] } )?.queryKey;
					return (
						Array.isArray( queryKey ) &&
						JSON.stringify( queryKey ) === JSON.stringify( readerAtmosphereKeys.thread( root.uri ) )
					);
				} )
			).toBe( true );
		} );
	} );

	describe( 'createPostMutation — standalone mode', () => {
		const connectionId = 42;
		const handle = 'me.bsky.social';

		const connectionDetails: AtmosphereConnectionDetails = {
			did: 'did:plc:me',
			handle,
			display_name: 'Me',
			description: '',
			avatar: 'https://cdn.bsky.app/me/avatar.jpg',
			banner: null,
			counts: { followers: 0, follows: 0, posts: 0 },
		};

		function seedConnection( client: QueryClient ) {
			client.setQueryData( readerAtmosphereKeys.connection( connectionId ), connectionDetails );
		}

		function seedTimeline( client: QueryClient, item: AtmosphereFeedItem ) {
			const data: InfiniteData< AtmosphereTimelinePage > = {
				pages: [ { items: [ item ], cursor: null } ],
				pageParams: [ undefined ],
			};
			client.setQueryData( readerAtmosphereKeys.timeline( connectionId ), data );
			return data;
		}

		function seedAuthorFeed(
			client: QueryClient,
			filter:
				| 'posts_no_replies'
				| 'posts_with_replies'
				| 'posts_with_media'
				| 'posts_and_author_threads'
				| undefined,
			item: AtmosphereFeedItem
		) {
			const data: InfiniteData< AtmosphereAuthorFeedPage > = {
				pages: [ { items: [ item ], cursor: null } ],
				pageParams: [ undefined ],
			};
			client.setQueryData( readerAtmosphereKeys.authorFeed( handle, filter ), data );
			return data;
		}

		afterEach( () => nock.cleanAll() );

		it( 'optimistically prepends a placeholder post to the connected timeline first page', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			seedTimeline( client, existing );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts`, {
					text: 'hello world',
				} )
				.delay( 100 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( { connectionId, text: 'hello world' } );
				await Promise.resolve();
			} );

			await waitFor( () => {
				const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
					readerAtmosphereKeys.timeline( connectionId )
				);
				expect( timeline?.pages[ 0 ].items ).toHaveLength( 2 );
				const placeholder = timeline?.pages[ 0 ].items[ 0 ];
				expect( placeholder?.uri.startsWith( PENDING_POST_URI ) ).toBe( true );
				expect( placeholder?.text ).toBe( 'hello world' );
				expect( placeholder?.author.handle ).toBe( handle );
				// Existing item still present, in the same position.
				expect( timeline?.pages[ 0 ].items[ 1 ].uri ).toBe( 'at://existing' );
			} );

			await promise;
		} );

		it( 'prepends the placeholder to all four author-feed filter caches when the handle is in cache', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );

			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			seedAuthorFeed( client, undefined, existing );
			seedAuthorFeed( client, 'posts_no_replies', existing );
			seedAuthorFeed( client, 'posts_with_replies', existing );
			seedAuthorFeed( client, 'posts_and_author_threads', existing );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 100 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( { connectionId, text: 'standalone' } );
				await Promise.resolve();
			} );

			await waitFor( () => {
				for ( const filter of [
					undefined,
					'posts_no_replies' as const,
					'posts_with_replies' as const,
					'posts_and_author_threads' as const,
				] ) {
					const feed = client.getQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
						readerAtmosphereKeys.authorFeed( handle, filter )
					);
					expect( feed?.pages[ 0 ].items ).toHaveLength( 2 );
					expect( feed?.pages[ 0 ].items[ 0 ].uri.startsWith( PENDING_POST_URI ) ).toBe( true );
					expect( feed?.pages[ 0 ].items[ 0 ].text ).toBe( 'standalone' );
					expect( feed?.pages[ 0 ].items[ 1 ].uri ).toBe( 'at://existing' );
				}
			} );

			await promise;
		} );

		it( 'does NOT prepend to the posts_with_media author-feed cache', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );

			const existing = makeFeedItem( { uri: 'at://existing-media', cid: 'media-cid' } );
			const seeded = seedAuthorFeed( client, 'posts_with_media', existing );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 100 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( { connectionId, text: 'no media' } );
				await Promise.resolve();
			} );

			// Give onMutate a microtask to run before asserting.
			await act( async () => {
				await Promise.resolve();
			} );

			const mediaFeed = client.getQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
				readerAtmosphereKeys.authorFeed( handle, 'posts_with_media' )
			);
			expect( mediaFeed ).toEqual( seeded );

			await promise;
		} );

		it( 'skips author-feed prepend when connection details are not in cache, but still patches the timeline', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			// No seedConnection(): cold connection cache (deep-link).
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			seedTimeline( client, existing );
			// Pre-seed an author-feed cache under the same handle that *would*
			// be patched if the connection were known. After onMutate it
			// should remain untouched.
			const seededFeed = seedAuthorFeed( client, undefined, existing );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 100 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( { connectionId, text: 'cold deep-link' } );
				await Promise.resolve();
			} );

			await waitFor( () => {
				const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
					readerAtmosphereKeys.timeline( connectionId )
				);
				expect( timeline?.pages[ 0 ].items ).toHaveLength( 2 );
				expect( timeline?.pages[ 0 ].items[ 0 ].uri.startsWith( PENDING_POST_URI ) ).toBe( true );
			} );

			// Author-feed cache untouched because the handle wasn't resolvable.
			const feed = client.getQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
				readerAtmosphereKeys.authorFeed( handle, undefined )
			);
			expect( feed ).toEqual( seededFeed );

			await promise;
		} );

		it( 'does not bump counts on any cached post (standalone has no parent)', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );
			const existing = makeFeedItem( {
				uri: 'at://existing',
				cid: 'existing-cid',
				counts: { replies: 7, reposts: 3, likes: 11, quotes: 2 },
			} );
			seedTimeline( client, existing );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 100 )
				.reply( 200, { post: { uri: 'at://new', cid: 'newcid', rkey: 'abc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( { connectionId, text: 'no bump' } );
				await Promise.resolve();
			} );

			await waitFor( () => {
				const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
					readerAtmosphereKeys.timeline( connectionId )
				);
				expect( timeline?.pages[ 0 ].items ).toHaveLength( 2 );
			} );

			// The existing post's counts must be unchanged: standalone has
			// no parent reference to bump.
			const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
				readerAtmosphereKeys.timeline( connectionId )
			);
			const existingAfter = timeline?.pages[ 0 ].items.find(
				( item ) => item.uri === 'at://existing'
			);
			expect( existingAfter?.counts ).toEqual( {
				replies: 7,
				reposts: 3,
				likes: 11,
				quotes: 2,
			} );

			await promise;
		} );

		it( 'restores the timeline snapshot on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			const initialTimeline = seedTimeline( client, existing );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( { connectionId, text: 'oops' } );
				} catch {
					/* expected */
				}
			} );

			const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
				readerAtmosphereKeys.timeline( connectionId )
			);
			expect( timeline ).toEqual( initialTimeline );
			expect( timeline?.pages[ 0 ].items ).toHaveLength( 1 );
			expect( timeline?.pages[ 0 ].items[ 0 ].uri ).toBe( 'at://existing' );
		} );

		it( 'restores all author-feed snapshots on error', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );

			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			const filters = [
				undefined,
				'posts_no_replies' as const,
				'posts_with_replies' as const,
				'posts_and_author_threads' as const,
			];
			const seeded = filters.map( ( filter ) => ( {
				filter,
				data: seedAuthorFeed( client, filter, existing ),
			} ) );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( { connectionId, text: 'oops' } );
				} catch {
					/* expected */
				}
			} );

			for ( const { filter, data } of seeded ) {
				const feed = client.getQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
					readerAtmosphereKeys.authorFeed( handle, filter )
				);
				expect( feed ).toEqual( data );
				expect( feed?.pages[ 0 ].items ).toHaveLength( 1 );
				expect( feed?.pages[ 0 ].items[ 0 ].uri ).toBe( 'at://existing' );
			}
		} );

		it( 'cold-cache standalone error restores timeline without throwing on missing author-feed snapshots', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			// No seedConnection(): cold connection cache so author-feed
			// snapshots are never captured.
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			const initialTimeline = seedTimeline( client, existing );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( { connectionId, text: 'cold deep-link' } );
				} catch {
					/* expected */
				}
			} );

			const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
				readerAtmosphereKeys.timeline( connectionId )
			);
			expect( timeline ).toEqual( initialTimeline );
		} );

		it( 'on success, swaps the timeline placeholder for an item carrying the real uri / cid', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			seedTimeline( client, existing );

			const realUri = 'at://did:plc:caller/app.bsky.feed.post/3kabc';
			const realCid = 'bafyrealcid';
			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts`, {
					text: 'hello world',
				} )
				.reply( 200, { post: { uri: realUri, cid: realCid, rkey: '3kabc' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( { connectionId, text: 'hello world' } );
			} );

			const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
				readerAtmosphereKeys.timeline( connectionId )
			);
			expect( timeline?.pages[ 0 ].items ).toHaveLength( 2 );
			const swapped = timeline?.pages[ 0 ].items[ 0 ];
			expect( swapped?.uri ).toBe( realUri );
			expect( swapped?.cid ).toBe( realCid );
			expect( swapped?.text ).toBe( 'hello world' );
			// Author preserved from the placeholder.
			expect( swapped?.author.handle ).toBe( handle );
			// No remaining sentinel placeholders anywhere on the page.
			for ( const item of timeline?.pages[ 0 ].items ?? [] ) {
				expect( item.uri.startsWith( PENDING_POST_URI ) ).toBe( false );
			}
			// Original existing item still there.
			expect( timeline?.pages[ 0 ].items[ 1 ].uri ).toBe( 'at://existing' );
		} );

		it( 'on success, swaps the placeholder in every patched author-feed cache', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			const filters = [
				undefined,
				'posts_no_replies' as const,
				'posts_with_replies' as const,
				'posts_and_author_threads' as const,
			];
			for ( const filter of filters ) {
				seedAuthorFeed( client, filter, existing );
			}

			const realUri = 'at://did:plc:caller/app.bsky.feed.post/3kxyz';
			const realCid = 'bafyrealcid2';
			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.reply( 200, { post: { uri: realUri, cid: realCid, rkey: '3kxyz' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				await result.current.mutateAsync( { connectionId, text: 'standalone' } );
			} );

			for ( const filter of filters ) {
				const feed = client.getQueryData< InfiniteData< AtmosphereAuthorFeedPage > >(
					readerAtmosphereKeys.authorFeed( handle, filter )
				);
				expect( feed?.pages[ 0 ].items ).toHaveLength( 2 );
				expect( feed?.pages[ 0 ].items[ 0 ].uri ).toBe( realUri );
				expect( feed?.pages[ 0 ].items[ 0 ].cid ).toBe( realCid );
				expect( feed?.pages[ 0 ].items[ 0 ].text ).toBe( 'standalone' );
				expect( feed?.pages[ 0 ].items[ 1 ].uri ).toBe( 'at://existing' );
			}
		} );

		it( 'invalidates the timeline when the cache was evicted between onMutate and onSuccess', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			seedTimeline( client, existing );

			const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 50 )
				.reply( 200, {
					post: {
						uri: 'at://did:plc:caller/app.bsky.feed.post/3kevicted',
						cid: 'bafyevict',
						rkey: '3kevicted',
					},
				} );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( { connectionId, text: 'evicted' } );
				await Promise.resolve();
			} );

			// Evict the timeline cache between onMutate (placeholder
			// prepended) and onSuccess (server response settling).
			const timelineKey = readerAtmosphereKeys.timeline( connectionId );
			client.removeQueries( { queryKey: timelineKey } );

			await act( async () => {
				await promise;
			} );

			// Cache was evicted, so onSuccess must invalidate it instead of
			// silently dropping the new post.
			const invalidatedKeys = invalidateSpy.mock.calls.map( ( c ) =>
				JSON.stringify( c[ 0 ]?.queryKey )
			);
			expect( invalidatedKeys ).toContain( JSON.stringify( timelineKey ) );

			invalidateSpy.mockRestore();
		} );

		it( 'invalidates the timeline when the cache exists but the placeholder was already removed', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			seedTimeline( client, existing );

			const invalidateSpy = jest.spyOn( client, 'invalidateQueries' );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.delay( 50 )
				.reply( 200, {
					post: {
						uri: 'at://did:plc:caller/app.bsky.feed.post/3kgone',
						cid: 'bafygone',
						rkey: '3kgone',
					},
				} );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let promise: Promise< unknown > = Promise.resolve();
			await act( async () => {
				promise = result.current.mutateAsync( { connectionId, text: 'gone' } );
				await Promise.resolve();
			} );

			// Concurrent refetch dropped the placeholder from the cache while
			// the cache itself remained populated.
			const timelineKey = readerAtmosphereKeys.timeline( connectionId );
			client.setQueryData< InfiniteData< AtmosphereTimelinePage > >( timelineKey, {
				pages: [ { items: [ existing ], cursor: null } ],
				pageParams: [ undefined ],
			} );

			await act( async () => {
				await promise;
			} );

			const invalidatedKeys = invalidateSpy.mock.calls.map( ( c ) =>
				JSON.stringify( c[ 0 ]?.queryKey )
			);
			expect( invalidatedKeys ).toContain( JSON.stringify( timelineKey ) );

			invalidateSpy.mockRestore();
		} );

		it( 'two concurrent standalone posts each swap their own placeholder for the right real item', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			seedTimeline( client, existing );

			const realUriA = 'at://did:plc:caller/app.bsky.feed.post/3kaaa';
			const realUriB = 'at://did:plc:caller/app.bsky.feed.post/3kbbb';
			// Reverse-order replies so B settles before A — exercises the
			// per-pendingUri swap targeting under realistic interleavings.
			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts`, {
					text: 'first',
				} )
				.delay( 80 )
				.reply( 200, { post: { uri: realUriA, cid: 'cidA', rkey: '3kaaa' } } );
			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts`, {
					text: 'second',
				} )
				.delay( 20 )
				.reply( 200, { post: { uri: realUriB, cid: 'cidB', rkey: '3kbbb' } } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			let pA: Promise< unknown > = Promise.resolve();
			let pB: Promise< unknown > = Promise.resolve();
			await act( async () => {
				pA = result.current.mutateAsync( { connectionId, text: 'first' } );
				await Promise.resolve();
				pB = result.current.mutateAsync( { connectionId, text: 'second' } );
				await Promise.resolve();
			} );

			await act( async () => {
				await Promise.all( [ pA, pB ] );
			} );

			const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >(
				readerAtmosphereKeys.timeline( connectionId )
			);
			const items = timeline?.pages[ 0 ].items ?? [];
			// Both real items present, no placeholders left, original existing item preserved.
			const uris = items.map( ( i ) => i.uri );
			expect( uris ).toContain( realUriA );
			expect( uris ).toContain( realUriB );
			expect( uris ).toContain( 'at://existing' );
			expect( uris.some( ( u ) => u.startsWith( PENDING_POST_URI ) ) ).toBe( false );
			// Each real item carries the text from its own mutation.
			expect( items.find( ( i ) => i.uri === realUriA )?.text ).toBe( 'first' );
			expect( items.find( ( i ) => i.uri === realUriB )?.text ).toBe( 'second' );
		} );

		it( 'on error, removes only this mutation’s placeholder and preserves a sibling placeholder', async () => {
			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedConnection( client );
			const existing = makeFeedItem( { uri: 'at://existing', cid: 'existing-cid' } );
			seedTimeline( client, existing );

			// Simulate a sibling in-flight mutation that prepended its own
			// placeholder after our onMutate captured its snapshot. A
			// whole-tree snapshot restore would clobber this; surgical
			// removal must leave it alone.
			const siblingPendingUri = `${ PENDING_POST_URI }#sibling`;
			const timelineKey = readerAtmosphereKeys.timeline( connectionId );
			const before = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >( timelineKey );
			client.setQueryData< InfiniteData< AtmosphereTimelinePage > >( timelineKey, {
				...( before as InfiniteData< AtmosphereTimelinePage > ),
				pages: ( before as InfiniteData< AtmosphereTimelinePage > ).pages.map( ( page, idx ) =>
					idx === 0
						? {
								...page,
								items: [ makeFeedItem( { uri: siblingPendingUri, cid: '' } ), ...page.items ],
						  }
						: page
				),
			} );

			nock( BASE )
				.post( `/wpcom/v2/reader/atmosphere/connections/${ connectionId }/posts` )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const { result } = renderHook( () => useMutation( createPostMutation( client ) ), {
				wrapper: makeWrapper( client ),
			} );

			await act( async () => {
				try {
					await result.current.mutateAsync( { connectionId, text: 'fails' } );
				} catch {
					/* expected */
				}
			} );

			const timeline = client.getQueryData< InfiniteData< AtmosphereTimelinePage > >( timelineKey );
			const uris = timeline?.pages[ 0 ].items.map( ( i ) => i.uri ) ?? [];
			expect( uris ).toContain( siblingPendingUri );
			expect( uris ).toContain( 'at://existing' );
			expect(
				uris.some( ( u ) => u.startsWith( PENDING_POST_URI ) && u !== siblingPendingUri )
			).toBe( false );
		} );
	} );

	describe( 'useCreateRepostMutation', () => {
		const POST_URI = 'at://did:plc:author/app.bsky.feed.post/3kabc';
		const POST_CID = 'bafy-cid';
		const REPOST_URI = 'at://did:plc:caller/app.bsky.feed.repost/3krkeyrkeyrke';

		function seedTimeline( client: QueryClient, item: AtmosphereFeedItem ) {
			const data: InfiniteData< AtmosphereTimelinePage > = {
				pages: [ { items: [ item ], cursor: 'NEXT' } as unknown as AtmosphereTimelinePage ],
				pageParams: [ undefined ],
			};
			client.setQueryData( readerAtmosphereKeys.timeline( 42 ), data );
		}

		it( 'optimistically flips viewer.repost to the pending sentinel and bumps counts.reposts', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
				.delay( 100 )
				.reply( 200, { repost: { uri: REPOST_URI, cid: 'bafy-r-cid', rkey: '3krkeyrkeyrke' } } );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline(
				client,
				makeFeedItem( {
					uri: POST_URI,
					cid: POST_CID,
					counts: { replies: 0, reposts: 2, likes: 5, quotes: 0 },
					viewer: { like: null, repost: null },
				} )
			);

			const { result } = renderHook( () => useCreateRepostMutation( 42 ), {
				wrapper: makeWrapper( client ),
			} );

			act( () => {
				result.current.mutate( { postUri: POST_URI, postCid: POST_CID } );
			} );

			await waitFor( () => {
				const data = client.getQueryData(
					readerAtmosphereKeys.timeline( 42 )
				) as InfiniteData< AtmosphereTimelinePage >;
				const item = data.pages[ 0 ].items[ 0 ];
				expect( item.viewer?.repost ).toBe( PENDING_REPOST_URI );
				expect( item.counts.reposts ).toBe( 3 );
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			const after = client.getQueryData(
				readerAtmosphereKeys.timeline( 42 )
			) as InfiniteData< AtmosphereTimelinePage >;
			expect( after.pages[ 0 ].items[ 0 ].viewer?.repost ).toBe( REPOST_URI );
			expect( after.pages[ 0 ].items[ 0 ].counts.reposts ).toBe( 3 );
		} );

		it( 'preserves viewer.like across an optimistic repost patch', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
				.reply( 200, { repost: { uri: REPOST_URI, cid: 'bafy-r-cid', rkey: '3krkeyrkeyrke' } } );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const existingLikeUri = 'at://did:plc:caller/app.bsky.feed.like/3kalreadyliked';
			seedTimeline(
				client,
				makeFeedItem( {
					uri: POST_URI,
					cid: POST_CID,
					counts: { replies: 0, reposts: 0, likes: 5, quotes: 0 },
					viewer: { like: existingLikeUri, repost: null },
				} )
			);

			const { result } = renderHook( () => useCreateRepostMutation( 42 ), {
				wrapper: makeWrapper( client ),
			} );

			act( () => {
				result.current.mutate( { postUri: POST_URI, postCid: POST_CID } );
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			const after = client.getQueryData(
				readerAtmosphereKeys.timeline( 42 )
			) as InfiniteData< AtmosphereTimelinePage >;
			const item = after.pages[ 0 ].items[ 0 ];
			expect( item.viewer?.like ).toBe( existingLikeUri );
			expect( item.viewer?.repost ).toBe( REPOST_URI );
			expect( item.counts.likes ).toBe( 5 );
		} );

		it( 'rolls the cache back on error', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline(
				client,
				makeFeedItem( {
					uri: POST_URI,
					cid: POST_CID,
					counts: { replies: 0, reposts: 2, likes: 0, quotes: 0 },
					viewer: { like: null, repost: null },
				} )
			);

			const { result } = renderHook( () => useCreateRepostMutation( 42 ), {
				wrapper: makeWrapper( client ),
			} );

			act( () => {
				result.current.mutate( { postUri: POST_URI, postCid: POST_CID } );
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );

			const after = client.getQueryData(
				readerAtmosphereKeys.timeline( 42 )
			) as InfiniteData< AtmosphereTimelinePage >;
			const item = after.pages[ 0 ].items[ 0 ];
			expect( item.viewer?.repost ).toBeNull();
			expect( item.counts.reposts ).toBe( 2 );
		} );

		it( 'leaves non-matching posts in the cache untouched', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
				.reply( 200, { repost: { uri: REPOST_URI, cid: 'bafy-r-cid', rkey: '3krkeyrkeyrke' } } );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const otherPost = makeFeedItem( {
				uri: 'at://did:plc:other/app.bsky.feed.post/3kother',
				cid: 'cid-other',
				counts: { replies: 0, reposts: 7, likes: 0, quotes: 0 },
				viewer: { like: null, repost: null },
			} );
			const targetPost = makeFeedItem( {
				uri: POST_URI,
				cid: POST_CID,
				counts: { replies: 0, reposts: 1, likes: 0, quotes: 0 },
				viewer: { like: null, repost: null },
			} );
			const data: InfiniteData< AtmosphereTimelinePage > = {
				pages: [
					{ items: [ otherPost, targetPost ], cursor: null } as unknown as AtmosphereTimelinePage,
				],
				pageParams: [ undefined ],
			};
			client.setQueryData( readerAtmosphereKeys.timeline( 42 ), data );

			const { result } = renderHook( () => useCreateRepostMutation( 42 ), {
				wrapper: makeWrapper( client ),
			} );

			act( () => {
				result.current.mutate( { postUri: POST_URI, postCid: POST_CID } );
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			const after = client.getQueryData(
				readerAtmosphereKeys.timeline( 42 )
			) as InfiniteData< AtmosphereTimelinePage >;
			expect( after.pages[ 0 ].items[ 0 ].counts.reposts ).toBe( 7 );
			expect( after.pages[ 0 ].items[ 0 ].viewer?.repost ).toBeNull();
			expect( after.pages[ 0 ].items[ 1 ].counts.reposts ).toBe( 2 );
			expect( after.pages[ 0 ].items[ 1 ].viewer?.repost ).toBe( REPOST_URI );
		} );

		it( 'patches the matching post in a thread cache entry', async () => {
			nock( BASE )
				.post( '/wpcom/v2/reader/atmosphere/connections/42/reposts' )
				.reply( 200, { repost: { uri: REPOST_URI, cid: 'bafy-r-cid', rkey: '3krkeyrkeyrke' } } );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const target = makeFeedItem( {
				uri: POST_URI,
				cid: POST_CID,
				counts: { replies: 0, reposts: 2, likes: 0, quotes: 0 },
				viewer: { like: null, repost: null },
			} );
			client.setQueryData< AtmosphereThreadResponse >( readerAtmosphereKeys.thread( POST_URI ), {
				thread: { type: 'post', post: target, parent: null, replies: [] },
			} );

			const { result } = renderHook( () => useCreateRepostMutation( 42 ), {
				wrapper: makeWrapper( client ),
			} );

			act( () => {
				result.current.mutate( { postUri: POST_URI, postCid: POST_CID } );
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			const after = client.getQueryData< AtmosphereThreadResponse >(
				readerAtmosphereKeys.thread( POST_URI )
			);
			expect( after?.thread.type ).toBe( 'post' );
			const post = after?.thread.type === 'post' ? after.thread.post : null;
			expect( post?.viewer?.repost ).toBe( REPOST_URI );
			expect( post?.counts.reposts ).toBe( 3 );
		} );
	} );

	describe( 'useDeleteRepostMutation', () => {
		const POST_URI = 'at://did:plc:author/app.bsky.feed.post/3kabc';
		const POST_CID = 'bafy-cid';
		const REPOST_URI = 'at://did:plc:caller/app.bsky.feed.repost/3krkeyrkeyrke';

		function seedTimeline( client: QueryClient, item: AtmosphereFeedItem ) {
			const data: InfiniteData< AtmosphereTimelinePage > = {
				pages: [ { items: [ item ], cursor: 'NEXT' } as unknown as AtmosphereTimelinePage ],
				pageParams: [ undefined ],
			};
			client.setQueryData( readerAtmosphereKeys.timeline( 42 ), data );
		}

		it( 'optimistically clears viewer.repost and decrements counts.reposts', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
				.reply( 204 );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline(
				client,
				makeFeedItem( {
					uri: POST_URI,
					cid: POST_CID,
					counts: { replies: 0, reposts: 4, likes: 0, quotes: 0 },
					viewer: { like: null, repost: REPOST_URI },
				} )
			);

			const { result } = renderHook( () => useDeleteRepostMutation( 42 ), {
				wrapper: makeWrapper( client ),
			} );

			act( () => {
				result.current.mutate( { rkey: '3krkeyrkeyrke', postUri: POST_URI } );
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			const after = client.getQueryData(
				readerAtmosphereKeys.timeline( 42 )
			) as InfiniteData< AtmosphereTimelinePage >;
			const item = after.pages[ 0 ].items[ 0 ];
			expect( item.viewer?.repost ).toBeNull();
			expect( item.counts.reposts ).toBe( 3 );
		} );

		it( 'floors counts.reposts at 0 when the cache is stale at 0', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
				.reply( 204 );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline(
				client,
				makeFeedItem( {
					uri: POST_URI,
					cid: POST_CID,
					counts: { replies: 0, reposts: 0, likes: 0, quotes: 0 },
					viewer: { like: null, repost: REPOST_URI },
				} )
			);

			const { result } = renderHook( () => useDeleteRepostMutation( 42 ), {
				wrapper: makeWrapper( client ),
			} );

			act( () => {
				result.current.mutate( { rkey: '3krkeyrkeyrke', postUri: POST_URI } );
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			const after = client.getQueryData(
				readerAtmosphereKeys.timeline( 42 )
			) as InfiniteData< AtmosphereTimelinePage >;
			expect( after.pages[ 0 ].items[ 0 ].counts.reposts ).toBe( 0 );
		} );

		it( 'rolls the cache back on error', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
				.reply( 401, { error: 'atmosphere_unauthenticated' } );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			seedTimeline(
				client,
				makeFeedItem( {
					uri: POST_URI,
					cid: POST_CID,
					counts: { replies: 0, reposts: 4, likes: 0, quotes: 0 },
					viewer: { like: null, repost: REPOST_URI },
				} )
			);

			const { result } = renderHook( () => useDeleteRepostMutation( 42 ), {
				wrapper: makeWrapper( client ),
			} );

			act( () => {
				result.current.mutate( { rkey: '3krkeyrkeyrke', postUri: POST_URI } );
			} );

			await waitFor( () => expect( result.current.isError ).toBe( true ) );

			const after = client.getQueryData(
				readerAtmosphereKeys.timeline( 42 )
			) as InfiniteData< AtmosphereTimelinePage >;
			const item = after.pages[ 0 ].items[ 0 ];
			expect( item.viewer?.repost ).toBe( REPOST_URI );
			expect( item.counts.reposts ).toBe( 4 );
		} );

		it( 'preserves viewer.like across an optimistic delete-repost patch', async () => {
			nock( BASE )
				.delete( '/wpcom/v2/reader/atmosphere/connections/42/reposts/3krkeyrkeyrke' )
				.reply( 204 );

			const client = new QueryClient( { defaultOptions: { mutations: { retry: false } } } );
			const existingLikeUri = 'at://did:plc:caller/app.bsky.feed.like/3kalreadyliked';
			seedTimeline(
				client,
				makeFeedItem( {
					uri: POST_URI,
					cid: POST_CID,
					counts: { replies: 0, reposts: 4, likes: 5, quotes: 0 },
					viewer: { like: existingLikeUri, repost: REPOST_URI },
				} )
			);

			const { result } = renderHook( () => useDeleteRepostMutation( 42 ), {
				wrapper: makeWrapper( client ),
			} );

			act( () => {
				result.current.mutate( { rkey: '3krkeyrkeyrke', postUri: POST_URI } );
			} );

			await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

			const after = client.getQueryData(
				readerAtmosphereKeys.timeline( 42 )
			) as InfiniteData< AtmosphereTimelinePage >;
			const item = after.pages[ 0 ].items[ 0 ];
			expect( item.viewer?.like ).toBe( existingLikeUri );
			expect( item.viewer?.repost ).toBeNull();
			expect( item.counts.likes ).toBe( 5 );
		} );
	} );
} );

describe( 'nextPendingPostUri', () => {
	it( 'produces unique URIs prefixed with the PENDING_POST_URI sentinel', () => {
		const a = nextPendingPostUri();
		const b = nextPendingPostUri();
		expect( a.startsWith( `${ PENDING_POST_URI }#` ) ).toBe( true );
		expect( b.startsWith( `${ PENDING_POST_URI }#` ) ).toBe( true );
		expect( a ).toMatch( /^__pending_post__#\d+$/ );
		expect( a ).not.toBe( b );
	} );
} );

describe( 'buildPlaceholderStandalonePost', () => {
	const connection: AtmosphereConnectionDetails = {
		did: 'did:plc:alice',
		handle: 'alice.bsky.social',
		display_name: 'Alice',
		description: '',
		avatar: 'https://example.test/a.jpg',
		banner: null,
		counts: { followers: 0, follows: 0, posts: 0 },
	};

	it( 'builds a placeholder feed item with sentinel URI, empty CID, hydrated author, and zero counts', () => {
		const pendingUri = `${ PENDING_POST_URI }#1`;
		const item = buildPlaceholderStandalonePost( 'hello world', pendingUri, connection );

		expect( item.uri ).toBe( pendingUri );
		expect( item.cid ).toBe( '' );
		expect( item.text ).toBe( 'hello world' );
		expect( item.html ).toBe( '' );
		expect( item.lang ).toEqual( [] );
		expect( item.author.did ).toBe( 'did:plc:alice' );
		expect( item.author.handle ).toBe( 'alice.bsky.social' );
		expect( item.author.display_name ).toBe( 'Alice' );
		expect( item.author.avatar ).toBe( 'https://example.test/a.jpg' );
		expect( item.counts ).toEqual( { replies: 0, reposts: 0, likes: 0, quotes: 0 } );
		expect( item.reply_parent ).toBeNull();
		expect( item.reply_root ).toBeNull();
		expect( item.reason ).toBeNull();
		expect( item.embed ).toBeNull();
		expect( item.viewer ).toEqual( { like: null, repost: null } );
		expect( item.bluesky_url ).toBe( '' );
		// Timestamps are populated with a real ISO string.
		expect( typeof item.created_at ).toBe( 'string' );
		expect( item.created_at ).toBe( item.indexed_at );
		expect( Number.isNaN( Date.parse( item.created_at ) ) ).toBe( false );
	} );

	it( 'falls back to empty author fields when no connection is provided', () => {
		const item = buildPlaceholderStandalonePost( 'x', `${ PENDING_POST_URI }#2`, undefined );

		expect( item.author.did ).toBe( '' );
		expect( item.author.handle ).toBe( '' );
		expect( item.author.display_name ).toBe( '' );
		expect( item.author.avatar ).toBeNull();
		expect( item.text ).toBe( 'x' );
	} );
} );

describe( 'swapPlaceholder', () => {
	const pendingUri = `${ PENDING_POST_URI }#7`;
	const placeholder = ( uri: string ): AtmosphereFeedItem =>
		makeFeedItem( { uri, cid: '', text: 'pending' } );
	const real = ( uri: string ): AtmosphereFeedItem =>
		makeFeedItem( { uri, cid: 'real-cid', text: 'real' } );

	it( 'replaces the placeholder in place on page 0 and preserves order', () => {
		const data: InfiniteData< { items: AtmosphereFeedItem[] } > = {
			pages: [
				{
					items: [ placeholder( pendingUri ), makeFeedItem( { uri: 'at://other-1', cid: 'c1' } ) ],
				},
			],
			pageParams: [ undefined ],
		};
		const replacement = real( 'at://real' );
		const next = swapPlaceholder( data, pendingUri, replacement );

		expect( next ).not.toBe( data );
		expect( next.pages[ 0 ].items ).toHaveLength( 2 );
		expect( next.pages[ 0 ].items[ 0 ].uri ).toBe( 'at://real' );
		expect( next.pages[ 0 ].items[ 1 ].uri ).toBe( 'at://other-1' );
	} );

	it( 'finds the placeholder on page 2 when a concurrent refetch shifted it', () => {
		const data: InfiniteData< { items: AtmosphereFeedItem[] } > = {
			pages: [
				{ items: [ makeFeedItem( { uri: 'at://newly-arrived', cid: 'cn' } ) ] },
				{
					items: [ placeholder( pendingUri ), makeFeedItem( { uri: 'at://other', cid: 'c2' } ) ],
				},
			],
			pageParams: [ undefined, 'cursor-1' ],
		};
		const replacement = real( 'at://real-shifted' );
		const next = swapPlaceholder( data, pendingUri, replacement );

		expect( next.pages[ 0 ].items[ 0 ].uri ).toBe( 'at://newly-arrived' );
		expect( next.pages[ 1 ].items[ 0 ].uri ).toBe( 'at://real-shifted' );
		expect( next.pages[ 1 ].items[ 1 ].uri ).toBe( 'at://other' );
	} );

	it( 'returns the input unchanged when no placeholder matches', () => {
		const data: InfiniteData< { items: AtmosphereFeedItem[] } > = {
			pages: [ { items: [ makeFeedItem( { uri: 'at://only-this', cid: 'c0' } ) ] } ],
			pageParams: [ undefined ],
		};
		const replacement = real( 'at://real' );
		const next = swapPlaceholder( data, pendingUri, replacement );

		expect( next ).toBe( data );
	} );

	it( 'replaces only the first matching placeholder when duplicates exist', () => {
		const data: InfiniteData< { items: AtmosphereFeedItem[] } > = {
			pages: [
				{
					items: [ placeholder( pendingUri ), makeFeedItem( { uri: 'at://other', cid: 'c0' } ) ],
				},
				{
					items: [ placeholder( pendingUri ) ],
				},
			],
			pageParams: [ undefined, 'cursor-1' ],
		};
		const replacement = real( 'at://real' );
		const next = swapPlaceholder( data, pendingUri, replacement );

		expect( next.pages[ 0 ].items[ 0 ].uri ).toBe( 'at://real' );
		// Page 2's duplicate untouched (helper stops after first swap).
		expect( next.pages[ 1 ].items[ 0 ].uri ).toBe( pendingUri );
	} );
} );

describe( 'removePlaceholder', () => {
	const pendingUri = `${ PENDING_POST_URI }#42`;
	const placeholder = ( uri: string ): AtmosphereFeedItem =>
		makeFeedItem( { uri, cid: '', text: 'pending' } );

	it( 'removes the placeholder on page 0 and preserves the remaining items', () => {
		const data: InfiniteData< { items: AtmosphereFeedItem[] } > = {
			pages: [
				{
					items: [
						placeholder( pendingUri ),
						makeFeedItem( { uri: 'at://other-1', cid: 'c1' } ),
						makeFeedItem( { uri: 'at://other-2', cid: 'c2' } ),
					],
				},
			],
			pageParams: [ undefined ],
		};
		const next = removePlaceholder( data, pendingUri );

		expect( next ).not.toBe( data );
		expect( next.pages[ 0 ].items ).toHaveLength( 2 );
		expect( next.pages[ 0 ].items.map( ( i ) => i.uri ) ).toEqual( [
			'at://other-1',
			'at://other-2',
		] );
	} );

	it( 'leaves a sibling placeholder (different pendingUri) in place', () => {
		const otherPendingUri = `${ PENDING_POST_URI }#99`;
		const data: InfiniteData< { items: AtmosphereFeedItem[] } > = {
			pages: [
				{
					items: [
						placeholder( otherPendingUri ),
						placeholder( pendingUri ),
						makeFeedItem( { uri: 'at://existing', cid: 'c1' } ),
					],
				},
			],
			pageParams: [ undefined ],
		};
		const next = removePlaceholder( data, pendingUri );

		expect( next.pages[ 0 ].items ).toHaveLength( 2 );
		expect( next.pages[ 0 ].items[ 0 ].uri ).toBe( otherPendingUri );
		expect( next.pages[ 0 ].items[ 1 ].uri ).toBe( 'at://existing' );
	} );

	it( 'returns the input unchanged when no placeholder matches', () => {
		const data: InfiniteData< { items: AtmosphereFeedItem[] } > = {
			pages: [ { items: [ makeFeedItem( { uri: 'at://only-this', cid: 'c0' } ) ] } ],
			pageParams: [ undefined ],
		};
		const next = removePlaceholder( data, pendingUri );

		expect( next ).toBe( data );
	} );
} );
