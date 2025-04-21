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
const API_SETTINGS = { migration_source_site_domain: 'example.com' };

const Wrapper =
	( queryClient: QueryClient ) =>
	( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

const render = ( plugin_slug?: string, theme_slug?: string ) => {
	const queryClient = new QueryClient();

	const renderResult = renderHook(
		() =>
			useRequestTransferWithSoftware(
				{
					siteId: SITE_ID,
					apiSettings: API_SETTINGS,
					plugin_slug: plugin_slug,
					theme_slug: theme_slug,
				},
				{ retry: 0 }
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

	it( 'should successfully request transfer with software and return the transfer_id', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/' + SITE_ID + '/atomic/transfer-with-software', {
				plugin_slug: 'plugin-1',
				theme_slug: 'theme-1',
				settings: API_SETTINGS,
			} )
			.query( {
				http_envelope: 1,
			} )
			.reply( 200, {
				transfer_id: 456,
				blog_id: SITE_ID,
				transfer_status: 'pending',
			} );

		const { result } = render( 'plugin-1', 'theme-1' );

		result.current.mutate();

		await waitFor(
			() => {
				expect( result.current.isSuccess ).toBe( true );
				expect( result.current.data ).toEqual( {
					transfer_id: 456,
					blog_id: SITE_ID,
					transfer_status: 'pending',
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'should return an error if both plugin_slug and theme_slug are not provided', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/' + SITE_ID + '/atomic/transfer-with-software', {
				plugin_slug: null,
				theme_slug: null,
				settings: API_SETTINGS,
			} )
			.query( { http_envelope: 1 } )
			.reply( replyErrorWithEnvelope( 400, { error: 'plugin_slug and theme_slug are required' } ) );
		const { result } = render();

		result.current.mutate();

		await waitFor(
			() => {
				expect( result.current.isError ).toBe( true );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'should successfully request the transfer with a plugin slug', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/' + SITE_ID + '/atomic/transfer-with-software', {
				plugin_slug: 'plugin-1',
				settings: API_SETTINGS,
			} )
			.query( { http_envelope: 1 } )
			.reply( 200, {
				transfer_id: 456,
				blog_id: SITE_ID,
				transfer_status: 'pending',
			} );

		const { result } = render( 'plugin-1' );

		result.current.mutate();

		await waitFor(
			() => {
				expect( result.current.isSuccess ).toBe( true );
				expect( result.current.data ).toEqual( {
					transfer_id: 456,
					blog_id: SITE_ID,
					transfer_status: 'pending',
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'should successfully request the transfer with a theme slug', async () => {
		nock( 'https://public-api.wordpress.com' )
			.post( '/wpcom/v2/sites/' + SITE_ID + '/atomic/transfer-with-software', {
				theme_slug: 'theme-1',
				settings: API_SETTINGS,
			} )
			.query( { http_envelope: 1 } )
			.reply( 200, {
				transfer_id: 456,
				blog_id: SITE_ID,
				transfer_status: 'pending',
			} );

		const { result } = render( undefined, 'theme-1' );

		result.current.mutate();

		await waitFor(
			() => {
				expect( result.current.isSuccess ).toBe( true );
				expect( result.current.data ).toEqual( {
					transfer_id: 456,
					blog_id: SITE_ID,
					transfer_status: 'pending',
				} );
			},
			{ timeout: 3000 }
		);
	} );
} );
