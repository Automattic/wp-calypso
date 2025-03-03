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
const SITE_ID = 123;
const PLUGINS = { 'plugin-1': 'install' as const };
const THEMES = { 'theme-1': 'activate' as const };

const Wrapper =
	( queryClient: QueryClient ) =>
	( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

const render = ( options = { retry: 0 } ) => {
	const queryClient = new QueryClient();

	const renderResult = renderHook(
		() => useRequestTransferWithSoftware( SITE_ID, PLUGINS, THEMES, options ),
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
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/sites/' + SITE_ID + '/atomic/transfer-with-software', {
				apiNamespace: 'wpcom/v2',
				body: {
					plugins: PLUGINS,
					themes: THEMES,
				},
			} )
			.query( { http_envelope: 1 } )
			.reply( 200, {
				success: true,
				transferId: 456,
			} );

		const { result } = render();

		result.current.mutate();

		await waitFor(
			() => {
				expect( result.current.isSuccess ).toBe( true );
				expect( result.current.data?.transferId ).toBe( 456 );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'should handle API errors', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( `/wpcom/v2/sites/${ SITE_ID }/atomic/transfer-with-software?http_envelope=1`, {
				plugins: PLUGINS,
				themes: THEMES,
			} )
			.reply( errorResponse );

		const { result } = render();

		result.current.mutate();

		await waitFor(
			() => {
				expect( result.current.isError ).toBe( true );
			},
			{ timeout: 3000 }
		);
	} );
} );
