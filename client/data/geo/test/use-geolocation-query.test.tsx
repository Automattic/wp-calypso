/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { when } from 'jest-when';
import { act, ReactNode } from 'react';
import { useGeoLocationQuery, GeoLocationData } from '../use-geolocation-query';

jest.useFakeTimers();

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
		when( jest.spyOn( globalThis, 'fetch' ) )
			.calledWith( 'https://public-api.wordpress.com/geo/' )
			.mockResolvedValue( { json: () => Promise.resolve( mockGeoData ) } as Response );
	} );

	it( 'should fetch geolocation data', async () => {
		const { result } = renderHook( () => useGeoLocationQuery(), { wrapper } );

		// Initially loading
		expect( result.current.isLoading ).toBe( true );

		// Wait for the query to complete
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		// Verify data
		expect( result.current.data ).toEqual( mockGeoData );
	} );

	it( 'should not refetch', async () => {
		const { result } = renderHook( () => useGeoLocationQuery(), { wrapper } );

		// Wait for the query to complete
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		act( () => {
			result.current.refetch();
		} );

		expect( result.current.isRefetching ).toBe( false );
	} );
} );
