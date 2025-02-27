/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useTransferWithSoftwareStatus } from '../use-transfer-with-software-status-query';

// Mock wpcom
jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

describe( 'useTransferWithSoftwareStatus', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => nock.cleanAll() );

	afterEach( () => jest.resetAllMocks() );

	const mockResponse = {
		blog_id: 123,
		atomic_transfer_id: 456,
		atomic_transfer_status: 'pending',
		plugins: { 'plugin-1': 'install' as const },
		themes: { 'theme-1': 'activate' as const },
		transfer_with_software_status: 'pending',
	};

	it( 'should fetch transfer status successfully', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		// Mock the API response using nock
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/123/atomic/transfer-with-software/456' )
			.query( { http_envelope: 1 } )
			.reply( 200, mockResponse );

		const { result } = renderHook( () => useTransferWithSoftwareStatus( 123, 456 ), { wrapper } );

		// Verify the data
		await waitFor( () => expect( result.current.isSuccess ).toBe( true ) );
		expect( result.current.data ).toEqual( mockResponse );
	} );

	it( 'should not fetch when siteId or atomicTransferId is missing', () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const { result } = renderHook( () => useTransferWithSoftwareStatus( 0, 456 ), { wrapper } );

		expect( result.current.isLoading ).toBe( false );
		expect( nock.isDone() ).toBe( true ); // No pending nock requests
	} );

	it( 'should handle error states', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/123/atomic/transfer-with-software/456' )
			.replyWithError( { message: 'API Error' } );

		const { result } = renderHook( () => useTransferWithSoftwareStatus( 123, 456 ), { wrapper } );

		await waitFor( () => expect( result.current.isError ).toBe( true ) );
		expect( result.current.error ).toBeDefined();
	} );
} );
