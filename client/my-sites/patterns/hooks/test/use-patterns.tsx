/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import wpcom from 'calypso/lib/wp';
import { usePatterns } from '../use-patterns';

jest.mock( 'calypso/lib/wp', () => ( { req: { get: jest.fn() } } ) );

describe( 'usePatterns', () => {
	let wrapper: React.FC< React.PropsWithChildren >;

	beforeEach( () => {
		jest.mocked( wpcom.req.get ).mockReset();

		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	test( 'calls the API endpoint with the right parameters', async () => {
		jest.mocked( wpcom.req.get ).mockResolvedValue( [] );

		const { result } = renderHook( () => usePatterns( 'fr', 'intro' ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( wpcom.req.get ).toHaveBeenCalledWith( '/ptk/patterns/fr', {
			categories: 'intro',
			post_type: 'wp_block',
		} );
		expect( result.current.data ).toEqual( [] );
	} );

	test( 'returns the expected data when successful', async () => {
		const patterns = [
			{
				ID: 1,
				html: '<div>Test pattern</div>',
				title: 'Test pattern',
				categories: { about: {} },
			},
		];

		jest.mocked( wpcom.req.get ).mockResolvedValue( patterns );

		const { result } = renderHook( () => usePatterns( 'en', 'about' ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( patterns );
	} );
} );
