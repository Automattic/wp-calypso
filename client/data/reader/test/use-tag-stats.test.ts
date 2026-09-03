/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { useTagStats } from '../use-tag-stats';

const mockGet = jest.fn();
jest.mock( 'calypso/lib/wp', () => ( {
	__esModule: true,
	default: { req: { get: ( ...args: unknown[] ) => mockGet( ...args ) } },
} ) );

let mockLocaleSlug: string | undefined = 'en';
jest.mock( 'i18n-calypso', () => ( {
	getLocaleSlug: () => mockLocaleSlug,
} ) );

function newClient() {
	return new QueryClient( { defaultOptions: { queries: { retry: false } } } );
}

function makeWrapper( client: QueryClient ) {
	return ( { children }: { children: ReactNode } ) =>
		createElement( QueryClientProvider, { client }, children );
}

describe( 'useTagStats', () => {
	beforeEach( () => {
		mockLocaleSlug = 'en';
		mockGet.mockReset();
		mockGet.mockResolvedValue( { total_posts: 318, total_sites: 139, posts_per_day: 1 } );
	} );

	it( 'strips the regional suffix and sends the base language slug as `lang`', async () => {
		mockLocaleSlug = 'pt-br';

		const { result } = renderHook( () => useTagStats( 'hero' ), {
			wrapper: makeWrapper( newClient() ),
		} );

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );
		expect( mockGet ).toHaveBeenCalledWith(
			'/read/topics/hero/stats',
			expect.objectContaining( { apiVersion: '1.3', lang: 'pt' } )
		);
	} );

	it( 'passes a base locale through unchanged', async () => {
		mockLocaleSlug = 'de';

		const { result } = renderHook( () => useTagStats( 'wordpress' ), {
			wrapper: makeWrapper( newClient() ),
		} );

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );
		expect( mockGet ).toHaveBeenCalledWith(
			'/read/topics/wordpress/stats',
			expect.objectContaining( { lang: 'de' } )
		);
	} );

	it( 'keys the cache by base language so counts do not leak across locales', async () => {
		mockLocaleSlug = 'pt-br';
		const client = newClient();

		const { result } = renderHook( () => useTagStats( 'hero' ), {
			wrapper: makeWrapper( client ),
		} );

		await waitFor( () => expect( result.current.isFetched ).toBe( true ) );
		expect( client.getQueryData( [ 'tag-stats', 'hero', 'pt' ] ) ).toBeDefined();
		expect( client.getQueryData( [ 'tag-stats', 'hero', 'en' ] ) ).toBeUndefined();
	} );
} );
