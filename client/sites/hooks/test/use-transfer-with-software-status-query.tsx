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

const mockSuccessResponse = {
	blog_id: 123,
	transfer_id: 456,
	transfer_status: 'completed',
};

describe( 'useTransferWithSoftwareStatus', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => nock.cleanAll() );

	afterEach( () => jest.resetAllMocks() );

	it( 'should fetch transfer status successfully', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		nock( 'https://public-api.wordpress.com' )
			.get( '/wpcom/v2/sites/123/atomic/transfer-with-software/456' )
			.query( { http_envelope: 1 } )
			.reply( 200, mockSuccessResponse );

		const { result } = renderHook( () => useTransferWithSoftwareStatus( 123, 456 ), { wrapper } );

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data ).toEqual( {
				transfer_status: 'completed',
			} );
		} );
	} );

	it( 'should not fetch when siteId is missing', () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const { result } = renderHook( () => useTransferWithSoftwareStatus( 0, 456 ), { wrapper } );

		expect( result.current.isFetching ).toBe( false );
		expect( nock.isDone() ).toBe( true ); // No pending nock requests
	} );

	it( 'should not fetch when transferId is missing', () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const { result } = renderHook( () => useTransferWithSoftwareStatus( 123, 0 ), { wrapper } );

		expect( result.current.isFetching ).toBe( false );
		expect( nock.isDone() ).toBe( true ); // No pending nock requests
	} );
} );
