/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import useHomeLayoutQuery, { getCacheKey, prefetchHomeLayout } from '../use-home-layout-query';

const mockGet = jest.fn();

jest.mock( 'calypso/lib/wp', () => ( {
	req: { get: ( ...args: unknown[] ) => mockGet( ...args ) },
} ) );

jest.mock( '../use-home-layout-query-params', () => ( {
	useHomeLayoutQueryParams: () => ( {} ),
	getHomeLayoutQueryParams: () => ( {} ),
} ) );

const SITE_ID = 1;

describe( 'useHomeLayoutQuery', () => {
	let queryClient: QueryClient;

	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

	beforeEach( () => {
		mockGet.mockReset().mockResolvedValue( { view_name: 'VIEW_SITE_SETUP' } );
		queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );
	} );

	it( 'uses a layout the route already requested instead of asking again', async () => {
		await prefetchHomeLayout( queryClient, SITE_ID );
		expect( mockGet ).toHaveBeenCalledTimes( 1 );

		const { result } = renderHook( () => useHomeLayoutQuery( SITE_ID ), { wrapper } );

		// The prefetched layout is available on the first render, with no placeholder.
		expect( result.current.isLoading ).toBe( false );
		expect( result.current.data ).toEqual( { view_name: 'VIEW_SITE_SETUP' } );

		await waitFor( () => expect( result.current.isFetching ).toBe( false ) );
		expect( mockGet ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'requests the layout itself when the route did not', async () => {
		const { result } = renderHook( () => useHomeLayoutQuery( SITE_ID ), { wrapper } );

		await waitFor( () => expect( result.current.data ).toBeDefined() );
		expect( mockGet ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'requests a fresh layout per navigation, so the view can change', async () => {
		await prefetchHomeLayout( queryClient, SITE_ID );
		renderHook( () => useHomeLayoutQuery( SITE_ID ), { wrapper } );

		// A second navigation prefetches again over a cache entry that never goes stale.
		await prefetchHomeLayout( queryClient, SITE_ID );

		expect( mockGet ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'recovers when the route request failed', async () => {
		mockGet.mockRejectedValueOnce( new Error( 'network' ) );
		await expect( prefetchHomeLayout( queryClient, SITE_ID ) ).rejects.toThrow( 'network' );
		expect( queryClient.getQueryData( getCacheKey( SITE_ID ) ) ).toBeUndefined();

		const { result } = renderHook( () => useHomeLayoutQuery( SITE_ID ), { wrapper } );

		await waitFor( () => expect( result.current.data ).toBeDefined() );
	} );
} );
