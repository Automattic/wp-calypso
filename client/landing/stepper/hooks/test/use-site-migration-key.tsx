/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useSiteMigrationKey } from '../use-site-migration-key';

describe( 'useSiteMigrationKey', () => {
	it( 'returns the site migration key', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/123/atomic-migration-status/migrate-guru-key' )
			.query( { http_envelope: 1 } )
			.once()
			.reply( 200, { migration_key: 'some-migration-key' } );

		const { result } = renderHook( () => useSiteMigrationKey( 123 ), { wrapper } );

		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data?.migrationKey ).toEqual( 'some-migration-key' );
	} );

	it( 'skip the request when the siteId is not available', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		const { result } = renderHook( () => useSiteMigrationKey( undefined ), { wrapper } );

		await waitFor( () => expect( result.current.isFetching ).toBe( false ) );
	} );

	it( 'skip the request when enabled is set as false', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

		const { result } = renderHook( () => useSiteMigrationKey( 123, { enabled: false } ), {
			wrapper,
		} );

		await waitFor( () => expect( result.current.isFetching ).toBe( false ) );
	} );
} );
