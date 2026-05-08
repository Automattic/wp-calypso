/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import { useSubmitButtonColor } from './use-submit-button-color';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

describe( 'useSubmitButtonColor', () => {
	let queryClient: QueryClient;
	let wrapper: React.FC< React.PropsWithChildren< unknown > >;

	beforeEach( () => {
		jest.mocked( wpcom.req.get ).mockReset();

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

	it( 'calls the correct endpoint', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( { color: '#ff5500' } );

		const { result } = renderHook( () => useSubmitButtonColor(), { wrapper } );

		await waitFor( () => expect( result.current ).not.toBeNull() );

		expect( wpcom.req.get ).toHaveBeenCalledWith( {
			path: '/submit-button-color',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'returns the color string when the API call succeeds', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( { color: '#ff5500' } );

		const { result } = renderHook( () => useSubmitButtonColor(), { wrapper } );

		await waitFor( () => expect( result.current ).toBe( '#ff5500' ) );
	} );

	it( 'returns null while the request is in flight', () => {
		// Return a promise that never resolves so the hook stays loading
		jest.mocked( wpcom.req.get ).mockReturnValue( new Promise( () => {} ) );

		const { result } = renderHook( () => useSubmitButtonColor(), { wrapper } );

		expect( result.current ).toBeNull();
	} );

	it( 'returns null when the API call fails', async () => {
		jest.mocked( wpcom.req.get ).mockRejectedValue( new Error( 'Server error' ) );

		const { result } = renderHook( () => useSubmitButtonColor(), { wrapper } );

		await waitFor( () => expect( result.current ).toBeNull() );
	} );

	it( 'returns null when the response has no color field', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( {} );

		const { result } = renderHook( () => useSubmitButtonColor(), { wrapper } );

		await waitFor( () => expect( result.current ).toBeNull() );
	} );
} );
