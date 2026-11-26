/**
 * @vitest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { ReactNode } from 'react';
import { vi } from 'vitest';
import { useGeoLocationQuery, GeoLocationData } from '../use-geolocation-query';

describe( 'useGeoLocationQuery', () => {
	const wrapper = ( { children }: { children: ReactNode } ) => (
		<QueryClientProvider client={ new QueryClient() }>{ children }</QueryClientProvider>
	);

	const mockGeoData: GeoLocationData = {
		city: 'San Francisco',
		country_long: 'United States',
		country_short: 'US',
		latitude: '37.7749',
		longitude: '-122.4194',
		region: 'California',
	};

	beforeAll( () => {
		vi.spyOn( globalThis, 'fetch' ).mockImplementation( async ( url ) =>
			url === 'https://public-api.wordpress.com/geo/'
				? ( { json: () => Promise.resolve( mockGeoData ) } as Response )
				: ( undefined as unknown as Response )
		);
	} );

	it( 'should fetch geolocation data', async () => {
		const { result } = renderHook( () => useGeoLocationQuery(), { wrapper } );

		// Initially loading, no data yet.
		expect( result.current.data ).toBe( undefined );

		// Verify data.
		await waitFor( () => expect( result.current.data ).toEqual( mockGeoData ) );
	} );

	it( 'keeps the data fresh', async () => {
		const { result } = renderHook( () => useGeoLocationQuery(), { wrapper } );

		await waitFor( () => expect( result.current.isStale ).toBe( false ) );
	} );
} );
