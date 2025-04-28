/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { useSelector } from 'calypso/state';
import { useCountryCodeQuery } from '../use-country-code-query';
import { useGeoLocationQuery } from '../use-geolocation-query';

jest.mock( 'calypso/state', () => ( {
	useSelector: jest.fn(),
} ) );

jest.mock( '../use-geolocation-query', () => ( {
	useGeoLocationQuery: jest.fn(),
} ) );

describe( 'useCountryCodeQuery', () => {
	beforeEach( () => {
		jest.resetAllMocks();
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	const createWrapper = () => {
		return ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider
				client={
					new QueryClient( {
						defaultOptions: {
							queries: {
								retry: false,
							},
						},
					} )
				}
			>
				{ children }
			</QueryClientProvider>
		);
	};

	it( 'should return current user country code from Redux state if available', () => {
		( useSelector as jest.Mock ).mockReturnValue( 'US' );
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( {
			data: { country_short: 'CA' },
			isLoading: false,
		} );

		const { result } = renderHook( () => useCountryCodeQuery(), {
			wrapper: createWrapper(),
		} );

		// Should return country code from user selector
		expect( result.current ).toBe( 'US' );

		// useGeoLocationQuery should not be enabled if we have a country code from user
		expect( useGeoLocationQuery ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: false } )
		);
	} );

	it( 'should return country code from geo hook if current user country code is not available', () => {
		( useSelector as jest.Mock ).mockReturnValue( null );
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( {
			data: { country_short: 'CA' },
			isLoading: false,
		} );

		const { result } = renderHook( () => useCountryCodeQuery(), {
			wrapper: createWrapper(),
		} );

		// Should return country code from geoData
		expect( result.current ).toBe( 'CA' );

		// useGeoLocationQuery should be enabled if we don't have a country code from user
		expect( useGeoLocationQuery ).toHaveBeenCalledWith(
			expect.objectContaining( { enabled: true } )
		);
	} );

	it( 'should return undefined if no country code is available from any source', () => {
		( useSelector as jest.Mock ).mockReturnValue( null );

		// Mock useGeoLocationQuery to have no data available
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( {
			data: null,
			isLoading: true,
		} );

		const { result } = renderHook( () => useCountryCodeQuery(), {
			wrapper: createWrapper(),
		} );

		// Should return undefined
		expect( result.current ).toBeUndefined();
	} );

	it( 'should pass additional options to useGeoLocationQuery', () => {
		// Mock the current user country code as null
		( useSelector as jest.Mock ).mockReturnValue( null );

		// Mock useGeoLocationQuery
		( useGeoLocationQuery as jest.Mock ).mockReturnValue( {
			data: { country_short: 'FR' },
			isLoading: false,
		} );

		const customOptions = {
			staleTime: 5000,
			cacheTime: 10000,
		};

		renderHook( () => useCountryCodeQuery( customOptions ), {
			wrapper: createWrapper(),
		} );

		// Should pass the custom options along with enabled
		expect( useGeoLocationQuery ).toHaveBeenCalledWith(
			expect.objectContaining( {
				enabled: true,
				staleTime: 5000,
				cacheTime: 10000,
			} )
		);
	} );
} );
