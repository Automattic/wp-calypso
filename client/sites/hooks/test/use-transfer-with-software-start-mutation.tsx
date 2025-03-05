/**
 * @jest-environment jsdom
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useRequestTransferWithSoftware } from '../use-transfer-with-software-start-mutation';

const replyErrorWithEnvelope =
	( status: number, defaultBody: Record< string, string | number > = {} ) =>
	( body = {} ) =>
	() => [ 200, { code: status, body: { ...defaultBody, ...body } } ];
const SITE_ID = 123;
const FROM = 'example.com';
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
		() =>
			useRequestTransferWithSoftware(
				{ siteId: SITE_ID, from: FROM, plugins: PLUGINS, themes: THEMES },
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
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/sites/' + SITE_ID + '/atomic/transfer-with-software', {
				apiNamespace: 'wpcom/v2',
				body: {
					plugins: PLUGINS,
					themes: THEMES,
					settings: { migration_source_site_domain: FROM },
				},
			} )
			.query( { http_envelope: 1 } )
			.reply( 200, {
				transferId: 456,
			} );

		const { result } = render();

		result.current.mutate();

		await waitFor(
			() => {
				expect( result.current.isSuccess ).toBe( true );
				expect( result.current.data ).toEqual( { transferId: 456 } );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'should return an error if plugins or themes are not provided', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/rest/v1.1/sites/' + SITE_ID + '/atomic/transfer-with-software', {
				apiNamespace: 'wpcom/v2',
				body: {
					plugins: null,
					themes: null,
					migration_source_site_domain: FROM,
				},
			} )
			.query( { http_envelope: 1 } )
			.reply( replyErrorWithEnvelope( 400, { error: 'plugins and themes are required' } ) );
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
