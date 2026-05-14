/**
 * @jest-environment jsdom
 */
import { renderHook, waitFor } from '@testing-library/react';
import wpcom from 'calypso/lib/wp';
import { useSubmitButtonColor } from '../use-submit-button-color';

jest.mock( 'calypso/lib/wp', () => ( {
	req: {
		get: jest.fn(),
	},
} ) );

const mockGet = ( wpcom.req.get as jest.Mock );

describe( 'useSubmitButtonColor', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'returns undefined before the fetch completes', () => {
		mockGet.mockReturnValue( new Promise( () => {} ) );

		const { result } = renderHook( () => useSubmitButtonColor() );

		expect( result.current ).toBeUndefined();
	} );

	it( 'returns the color from the API response', async () => {
		mockGet.mockResolvedValue( { color: '#ff0000' } );

		const { result } = renderHook( () => useSubmitButtonColor() );

		await waitFor( () => expect( result.current ).toBe( '#ff0000' ) );
	} );

	it( 'calls the correct API endpoint', () => {
		mockGet.mockReturnValue( new Promise( () => {} ) );

		renderHook( () => useSubmitButtonColor() );

		expect( mockGet ).toHaveBeenCalledWith( {
			path: '/submit-button-color',
			apiNamespace: 'wpcom/v2',
		} );
	} );

	it( 'returns undefined when the API response has no color field', async () => {
		mockGet.mockResolvedValue( {} );

		const { result } = renderHook( () => useSubmitButtonColor() );

		// Flush pending promises
		await waitFor( () => expect( mockGet ).toHaveBeenCalled() );

		expect( result.current ).toBeUndefined();
	} );

	it( 'returns undefined when the API request fails', async () => {
		mockGet.mockRejectedValue( new Error( 'Network error' ) );

		const { result } = renderHook( () => useSubmitButtonColor() );

		// Flush pending promises; error is swallowed, color stays undefined
		await waitFor( () => expect( mockGet ).toHaveBeenCalled() );

		expect( result.current ).toBeUndefined();
	} );
} );
