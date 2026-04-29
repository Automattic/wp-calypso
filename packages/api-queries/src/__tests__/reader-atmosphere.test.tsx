import {
	readerAtmosphereKeys,
	type AtmosphereFeedItem,
	type AtmosphereThreadResponse,
	AtmosphereAuthorFeedPage,
	AtmosphereAuthorProfile,
} from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	useAuthorFeedInfiniteQuery,
	useAuthorProfileQuery,
	useConnectionQuery,
	useConnectionsQuery,
	useCreateConnectionMutation,
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
} );
