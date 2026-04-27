import { readerAtmosphereKeys } from '@automattic/api-core';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import {
	useConnectionQuery,
	useConnectionsQuery,
	useCreateConnectionMutation,
	useTimelineInfiniteQuery,
} from '../reader-atmosphere';

const BASE = 'https://public-api.wordpress.com';
function makeWrapper( c: QueryClient ) {
	function Wrapper( { children }: { children: React.ReactNode } ) {
		return <QueryClientProvider client={ c }>{ children }</QueryClientProvider>;
	}
	return Wrapper;
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
} );
