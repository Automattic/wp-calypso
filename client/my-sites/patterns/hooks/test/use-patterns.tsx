/**
 * @vitest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import wpcom from 'calypso/lib/wp';
import { usePatterns } from '../use-patterns';

vi.mock( 'calypso/lib/wp', () =>
	( ( m ) => ( { ...m, default: m } ) )( { req: { get: vi.fn() } } )
);

describe( 'usePatterns', () => {
	let wrapper: React.FC< React.PropsWithChildren >;

	beforeEach( () => {
		vi.mocked( wpcom.req.get ).mockReset();

		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	afterEach( () => {
		vi.clearAllMocks();
	} );

	test( 'calls the API endpoint with the right parameters', async () => {
		vi.mocked( wpcom.req.get ).mockResolvedValue( [] );

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

		vi.mocked( wpcom.req.get ).mockResolvedValue( patterns );

		const { result } = renderHook( () => usePatterns( 'en', 'about' ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( patterns );
	} );
} );
