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

import wp from 'calypso/lib/wp';
const mockWpReqGet = wp.req.get as jest.Mock;

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

describe( 'useSubmitButtonColor', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns undefined while loading', () => {
		mockWpReqGet.mockReturnValue( new Promise( () => {} ) );
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );
		expect( result.current ).toBeUndefined();
	} );

	it( 'returns the color string from the endpoint', async () => {
		mockWpReqGet.mockResolvedValue( 'red' );
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => {
			expect( result.current ).toBe( 'red' );
		} );
	} );

	it( 'calls the correct endpoint', async () => {
		mockWpReqGet.mockResolvedValue( 'blue' );
		renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => {
			expect( mockWpReqGet ).toHaveBeenCalledWith( {
				path: '/submit-button-color',
				apiNamespace: 'wpcom/v2',
			} );
		} );
	} );
} );
