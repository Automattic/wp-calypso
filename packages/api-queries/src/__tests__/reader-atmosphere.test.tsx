import {
	PENDING_LIKE_URI,
	readerAtmosphereKeys,
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
	followAtmosphereActorMutation,
	unfollowAtmosphereActorMutation,
	useAuthorFeedInfiniteQuery,
	useAuthorProfileQuery,
	useConnectionQuery,
	useConnectionsQuery,
	useCreateConnectionMutation,
	useCreateLikeMutation,
	useDeleteLikeMutation,
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
} );
