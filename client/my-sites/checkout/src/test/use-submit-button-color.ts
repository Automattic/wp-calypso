/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import useSubmitButtonColor from '../hooks/use-submit-button-color';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

// eslint-disable-next-line @typescript-eslint/no-var-requires
const wpcom = require( 'calypso/lib/wp' );

function createWrapper() {
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );
	return function Wrapper( { children }: { children: React.ReactNode } ) {
		return React.createElement( QueryClientProvider, { client: queryClient }, children );
	};
}

describe( 'useSubmitButtonColor', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns undefined while loading', () => {
		wpcom.req.get.mockReturnValue( new Promise( () => {} ) ); // never resolves

		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );

		expect( result.current ).toBeUndefined();
	} );

	it( 'returns the color from the API response', async () => {
		const expectedColor = '#ff5500';
		wpcom.req.get.mockResolvedValue( { color: expectedColor } );

		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => {
			expect( result.current ).toBe( expectedColor );
		} );
	} );

	it( 'returns undefined on API error', async () => {
		wpcom.req.get.mockRejectedValue( new Error( 'Network error' ) );

		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );

		await waitFor( () => {
			expect( result.current ).toBeUndefined();
		} );
	} );
} );
