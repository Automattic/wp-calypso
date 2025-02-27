/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useRequestTransferWithSoftware } from '../use-transfer-with-software-start-mutation';
import { replyWithError } from './helpers/nock';

const errorResponse = replyWithError( { error: 'any generic error' } );
const siteId = 123;
const plugins = { 'plugin-1': 'install' };
const themes = { 'theme-1': 'activate' };

const Wrapper =
	( queryClient: QueryClient ) =>
	( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

const render = ( options = { retry: 0 } ) => {
	const queryClient = new QueryClient();

	const renderResult = renderHook(
		() =>
			useRequestTransferWithSoftware(
				siteId,
				plugins as Record< string, 'install' | 'activate' >,
				themes as Record< string, 'install' | 'activate' >,
				options
			),
		{
			wrapper: Wrapper( queryClient ),
		}
	);

	return {
		...renderResult,
		queryClient,
	};
};

describe( 'useRequestTransferWithSoftware', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => nock.cleanAll() );

	it( 'should successfully request transfer with software and return the transferId', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( `/wpcom/v2/sites/${ siteId }/atomic/transfer-with-software?http_envelope=1`, {
				plugins,
				themes,
			} )
			.reply( 200, { transferId: 456 } );

		const { result } = render();

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isSuccess ).toBe( true );
			expect( result.current.data?.transferId ).toBe( 456 );
		} );
	} );

	it( 'should handle API errors', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( `/wpcom/v2/sites/${ siteId }/atomic/transfer-with-software?http_envelope=1`, {
				plugins,
				themes,
			} )
			.reply( errorResponse );

		const { result } = render();

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
		} );
	} );
} );
