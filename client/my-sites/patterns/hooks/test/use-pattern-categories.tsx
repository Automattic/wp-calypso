/**
 * @vitest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import React from 'react';
import { vi } from 'vitest';
import wpcom from 'calypso/lib/wp';
import { usePatternCategories } from '../use-pattern-categories';
import type { Category } from 'calypso/my-sites/patterns/types';

vi.mock( 'calypso/lib/wp', () =>
	( ( m ) => ( { ...m, default: m } ) )( { req: { get: vi.fn() } } )
);

describe( 'usePatternCategories', () => {
	let wrapper: React.FC< React.PropsWithChildren< any > >;

	beforeEach( () => {
		vi.mocked( wpcom.req.get ).mockReset();

		const queryClient = new QueryClient( { defaultOptions: { queries: { retry: false } } } );

		wrapper = ( { children }: React.PropsWithChildren< any > ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
	} );

	afterEach( () => {
		vi.clearAllMocks();
	} );

	test( 'calls the API endpoint with the right parameters', async () => {
		vi.mocked( wpcom.req.get ).mockResolvedValue( [] );

		const { result } = renderHook( () => usePatternCategories( 'fr' ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( wpcom.req.get ).toHaveBeenCalledWith( '/ptk/categories/fr' );
		expect( result.current.data ).toEqual( [] );
	} );

	test( 'returns the expected data when successful', async () => {
		const categories: Category[] = [
			{
				name: 'about',
				title: 'À propos',
				description: '',
			},
		];

		vi.mocked( wpcom.req.get ).mockResolvedValue( categories );

		const { result } = renderHook( () => usePatternCategories( 'fr' ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );

		expect( result.current.data ).toEqual( categories );
	} );
} );
