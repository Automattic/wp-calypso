/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wp from 'calypso/lib/wp';
import useSubmitButtonColor, { fetchSubmitButtonColor } from '../hooks/use-submit-button-color';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

const mockWpReqGet = wp.req.get as jest.Mock;

describe( 'fetchSubmitButtonColor', () => {
	beforeEach( () => {
		mockWpReqGet.mockReset();
	} );

	it( 'returns string response directly', async () => {
		mockWpReqGet.mockResolvedValue( 'red' );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBe( 'red' );
		expect( mockWpReqGet ).toHaveBeenCalledWith( '/submit-button-color', {
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'returns color from object response', async () => {
		mockWpReqGet.mockResolvedValue( { color: '#ff0000' } );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBe( '#ff0000' );
	} );

	it( 'returns undefined for null response', async () => {
		mockWpReqGet.mockResolvedValue( null );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBeUndefined();
	} );

	it( 'returns undefined for object without color property', async () => {
		mockWpReqGet.mockResolvedValue( { other: 'value' } );
		const result = await fetchSubmitButtonColor();
		expect( result ).toBeUndefined();
	} );
} );

describe( 'useSubmitButtonColor', () => {
	function createWrapper() {
		const queryClient = new QueryClient( {
			defaultOptions: { queries: { retry: false } },
		} );
		return ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	}

	beforeEach( () => {
		mockWpReqGet.mockReset();
	} );

	it( 'returns undefined while loading', () => {
		mockWpReqGet.mockReturnValue( new Promise( () => {} ) ); // never resolves
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );
		expect( result.current ).toBeUndefined();
	} );

	it( 'returns the color on success', async () => {
		mockWpReqGet.mockResolvedValue( 'red' );
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => {
			expect( result.current ).toBe( 'red' );
		} );
	} );

	it( 'returns undefined on error', async () => {
		mockWpReqGet.mockRejectedValue( new Error( 'Network error' ) );
		const { result } = renderHook( () => useSubmitButtonColor(), {
			wrapper: createWrapper(),
		} );
		await waitFor( () => {
			// After error, data remains undefined
			expect( result.current ).toBeUndefined();
		} );
	} );
} );
