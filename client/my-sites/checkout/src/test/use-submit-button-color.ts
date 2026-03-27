/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wp from 'calypso/lib/wp';
import useSubmitButtonColor from '../hooks/use-submit-button-color';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

describe( 'useSubmitButtonColor', () => {
	let queryClient: QueryClient;
	let wrapper: React.FC< React.PropsWithChildren< unknown > >;

	beforeEach( () => {
		jest.mocked( wp.req.get ).mockReset();

		queryClient = new QueryClient( {
			defaultOptions: {
				queries: {
					retry: false,
				},
			},
		} );

		wrapper = ( { children }: React.PropsWithChildren< unknown > ) =>
			React.createElement( QueryClientProvider, { client: queryClient }, children );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns null while loading', () => {
		jest.mocked( wp.req.get ).mockReturnValue( new Promise( () => {} ) );

		const { result } = renderHook( () => useSubmitButtonColor(), { wrapper } );

		expect( result.current ).toBeNull();
	} );

	it( 'returns the color string from the API', async () => {
		jest.mocked( wp.req.get ).mockResolvedValue( 'red' );

		const { result } = renderHook( () => useSubmitButtonColor(), { wrapper } );

		await waitFor( () => expect( result.current ).toBe( 'red' ) );
	} );

	it( 'returns null when API returns a non-string value', async () => {
		jest.mocked( wp.req.get ).mockResolvedValue( { color: 'red' } );

		const { result } = renderHook( () => useSubmitButtonColor(), { wrapper } );

		await waitFor( () => expect( result.current ).toBeNull() );
	} );

	it( 'returns null when API call fails', async () => {
		jest.mocked( wp.req.get ).mockRejectedValue( new Error( 'Network error' ) );

		const { result } = renderHook( () => useSubmitButtonColor(), { wrapper } );

		await waitFor( () => expect( result.current ).toBeNull() );
	} );
} );
