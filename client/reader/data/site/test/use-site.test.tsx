/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import { thunk as thunkMiddleware } from 'redux-thunk';
import initialReducer from 'calypso/state/reducer';
import { useSite } from '../use-site';

const BASE = 'https://public-api.wordpress.com';

function makeWrapper() {
	const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	const store = createStore( initialReducer, {}, applyMiddleware( thunkMiddleware ) );
	const dispatched: { type: string; payload?: unknown }[] = [];
	const realDispatch = store.dispatch;
	store.dispatch = ( ( action: { type: string; payload?: unknown } ) => {
		dispatched.push( action );
		return realDispatch( action );
	} ) as typeof store.dispatch;

	const Wrapper = ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>
			<Provider store={ store }>{ children }</Provider>
		</QueryClientProvider>
	);

	return { Wrapper, dispatched };
}

describe( 'useSite', () => {
	afterEach( () => nock.cleanAll() );

	it( 'returns the adapted site when the query resolves', async () => {
		nock( BASE ).get( '/rest/v1.1/read/sites/123' ).query( true ).reply( 200, {
			ID: 123,
			URL: 'https://example.wordpress.com',
			name: 'Example',
			is_following: true,
		} );

		const { Wrapper } = makeWrapper();
		const { result } = renderHook( () => useSite( 123 ), { wrapper: Wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.site ).toMatchObject( {
			ID: 123,
			domain: 'example.wordpress.com',
			slug: 'example.wordpress.com',
			title: 'Example',
		} );
		expect( result.current.siteError ).toBeUndefined();
	} );

	it( 'dispatches READER_SITE_RECEIVE with the raw payload (including subscription) on success', async () => {
		nock( BASE )
			.get( '/rest/v1.1/read/sites/200' )
			.query( true )
			.reply( 200, {
				ID: 200,
				URL: 'https://example.wordpress.com',
				name: 'Example',
				is_following: true,
				feed_URL: 'https://example.wordpress.com/feed',
				subscription: { delivery_methods: { email: { send_posts: true } } },
			} );

		const { Wrapper, dispatched } = makeWrapper();
		const { result } = renderHook( () => useSite( 200 ), { wrapper: Wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		const receiveActions = dispatched.filter( ( a ) => a.type === 'READER_SITE_RECEIVE' );
		expect( receiveActions ).toHaveLength( 1 );
		const payload = receiveActions[ 0 ].payload as {
			ID: number;
			subscription?: { delivery_methods?: unknown };
		};
		// The dispatched payload must be the raw API response so the follows
		// reducer can read `subscription.delivery_methods` (which adaptReadSite strips).
		expect( payload.ID ).toBe( 200 );
		expect( payload.subscription?.delivery_methods ).toEqual( {
			email: { send_posts: true },
		} );
	} );

	it( 'dispatches READER_SITE_RECEIVE once for multiple observers of the same site update', async () => {
		nock( BASE ).get( '/rest/v1.1/read/sites/201' ).query( true ).reply( 200, {
			ID: 201,
			URL: 'https://example.wordpress.com',
			name: 'Example',
			is_following: true,
			feed_URL: 'https://example.wordpress.com/feed',
		} );

		const { Wrapper, dispatched } = makeWrapper();
		const { result } = renderHook( () => [ useSite( 201 ), useSite( 201 ) ] as const, {
			wrapper: Wrapper,
		} );

		await waitFor( () => expect( result.current[ 0 ].isSuccess ).toBe( true ) );
		await waitFor( () => expect( result.current[ 1 ].isSuccess ).toBe( true ) );
		expect( dispatched.filter( ( a ) => a.type === 'READER_SITE_RECEIVE' ) ).toHaveLength( 1 );
	} );

	it( 'exposes siteError with statusCode when the query fails', async () => {
		nock( BASE ).get( '/rest/v1.1/read/sites/410' ).query( true ).reply( 410, { code: 'gone' } );

		const { Wrapper } = makeWrapper();
		const { result } = renderHook( () => useSite( 410 ), { wrapper: Wrapper } );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( result.current.siteError?.statusCode ).toBe( 410 );
	} );

	it( 'is disabled (no fetch, no dispatch) for falsy siteId', () => {
		const { Wrapper, dispatched } = makeWrapper();
		const { result } = renderHook( () => useSite( undefined ), { wrapper: Wrapper } );
		expect( result.current.site ).toBeUndefined();
		expect( result.current.isLoading ).toBe( false );
		expect( dispatched.filter( ( a ) => a.type === 'READER_SITE_RECEIVE' ) ).toHaveLength( 0 );
	} );
} );
