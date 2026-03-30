/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { fetchSubmitButtonColor } from '../hooks/use-submit-button-color';
import useSubmitButtonColor from '../hooks/use-submit-button-color';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

import wp from 'calypso/lib/wp';

const mockWpGet = wp.req.get as jest.Mock;

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
		mockWpGet.mockClear();
	} );

	it( 'returns the color when response is a plain string', async () => {
		mockWpGet.mockResolvedValue( 'red' );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBe( 'red' );
	} );

	it( 'returns the color when response is a { color } object', async () => {
		mockWpGet.mockResolvedValue( { color: '#ff0000' } );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBe( '#ff0000' );
	} );

	it( 'returns undefined when response is null', async () => {
		mockWpGet.mockResolvedValue( null );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBeUndefined();
	} );

	it( 'returns undefined when the request throws', async () => {
		mockWpGet.mockRejectedValue( new Error( 'Network error' ) );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBeUndefined();
	} );
} );

describe( 'useSubmitButtonColor', () => {
	beforeEach( () => {
		mockWpGet.mockClear();
	} );

	it( 'returns undefined while loading', () => {
		mockWpGet.mockReturnValue( new Promise( () => {} ) );
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );
		expect( result.current ).toBeUndefined();
	} );

	it( 'returns the color on success', async () => {
		mockWpGet.mockResolvedValue( 'red' );
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => expect( result.current ).toBe( 'red' ) );
	} );

	it( 'returns undefined on error', async () => {
		mockWpGet.mockRejectedValue( new Error( 'Server error' ) );
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );
		// fetchSubmitButtonColor catches errors and returns undefined, so data will be undefined
		await waitFor( () => expect( result.current ).toBeUndefined() );
	} );
} );
