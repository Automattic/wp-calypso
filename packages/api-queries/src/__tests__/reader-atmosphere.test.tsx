import {
	readerAtmosphereKeys,
	type AtmosphereFeedItem,
	type AtmosphereThreadResponse,
} from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
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
				raw: {},
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
			nock( BASE )
				.get( '/wpcom/v2/reader/atmosphere/thread' )
				.query( { uri: FIXTURE_URI } )
				.reply( 502, { error: 'atmosphere_upstream_unavailable' } );

			const client = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
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
	} );
} );
