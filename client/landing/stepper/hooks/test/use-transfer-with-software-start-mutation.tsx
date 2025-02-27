/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useRequestTransferWithSoftware } from '../use-transfer-with-software-start-mutation';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: jest.fn(),
} ) );

describe( 'useRequestTransferWithSoftware', () => {
	beforeAll( () => nock.disableNetConnect() );

	beforeEach( () => nock.cleanAll() );

	afterEach( () => jest.resetAllMocks() );

	it( 'should successfully request transfer with software and return the transferId', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const siteId = 123;
		const plugins = { 'plugin-1': 'install' };
		const themes = { 'theme-1': 'activate' };

		const scope = nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v2/sites/${ siteId }/atomic/transfer-with-software`, {
				plugins,
				themes,
			} )
			.query( { http_envelope: 1 } )
			.reply( 200, { transferId: 456 } );

		const { result } = renderHook(
			() =>
				useRequestTransferWithSoftware(
					siteId,
					plugins as Record< string, 'install' | 'activate' >,
					themes as Record< string, 'install' | 'activate' >
				),
			{ wrapper }
		);

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data?.transferId ).toBe( 456 );
		} );

		scope.done();
	} );

	it( 'should handle API errors', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const siteId = 123;
		const plugins = { 'plugin-1': 'install' };
		const themes = { 'theme-1': 'activate' };

		const scope = nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v2/sites/${ siteId }/atomic/transfer-with-software`, {
				plugins,
				themes,
			} )
			.query( { http_envelope: 1 } )
			.reply( 400, { error: 'Bad Request' } );

		const { result } = renderHook(
			() =>
				useRequestTransferWithSoftware(
					siteId,
					plugins as Record< string, 'install' | 'activate' >,
					themes as Record< string, 'install' | 'activate' >
				),
			{ wrapper }
		);

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
		} );

		scope.done();
	} );

	it( 'should respect custom retry options', async () => {
		const queryClient = new QueryClient();
		const wrapper = ( { children }: { children: React.ReactNode } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);
		const siteId = 123;
		const retryCount = 2;

		const scope = nock( 'https://public-api.wordpress.com' )
			.post( `/rest/v2/sites/${ siteId }/atomic/transfer-with-software`, {
				plugins: {},
				themes: {},
			} )
			.query( { http_envelope: 1 } )
			.times( retryCount + 1 ) // Initial request + retry attempts
			.reply( 500 );

		const { result } = renderHook(
			() => useRequestTransferWithSoftware( siteId, {}, {}, { retry: retryCount } ),
			{ wrapper }
		);

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
		} );

		scope.done();
	} );
} );
