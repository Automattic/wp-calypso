/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { fetchSubmitButtonColor } from '../hooks/use-submit-button-color';
import useSubmitButtonColor from '../hooks/use-submit-button-color';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

import wp from 'calypso/lib/wp';
const mockGet = wp.req.get as jest.Mock;

function createWrapper() {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );
	return ( { children }: { children: React.ReactNode } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);
}

describe( 'fetchSubmitButtonColor', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns the color string when the API returns a plain string', async () => {
		mockGet.mockResolvedValue( 'red' );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBe( 'red' );
	} );

	it( 'returns the color string when the API returns an object with a color field', async () => {
		mockGet.mockResolvedValue( { color: '#ff0000' } );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBe( '#ff0000' );
	} );

	it( 'returns undefined when the API returns an unexpected value', async () => {
		mockGet.mockResolvedValue( null );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBeUndefined();
	} );

	it( 'calls the correct endpoint', async () => {
		mockGet.mockResolvedValue( 'red' );
		await fetchSubmitButtonColor();
		expect( mockGet ).toHaveBeenCalledWith( '/submit-button-color', {
			apiNamespace: 'wpcom/v2',
		} );
	} );
} );

describe( 'useSubmitButtonColor', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns the color string from the API', async () => {
		mockGet.mockResolvedValue( 'red' );
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => {
			expect( result.current ).toBe( 'red' );
		} );
	} );

	it( 'returns undefined while loading', () => {
		mockGet.mockReturnValue( new Promise( () => {} ) ); // Never resolves
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );

		expect( result.current ).toBeUndefined();
	} );

	it( 'returns undefined when the API call fails', async () => {
		mockGet.mockRejectedValue( new Error( 'Network error' ) );
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => {
			// After error, data remains undefined
			expect( result.current ).toBeUndefined();
		} );
	} );
} );
