/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { usePluginInstallation } from '../use-plugin-installation';

const Wrapper =
	( queryClient: QueryClient ) =>
	( { children } ) => (
		<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
	);

const render = ( { siteId }, options = { retry: 0 } ) => {
	const queryClient = new QueryClient();

	const renderResult = renderHook( () => usePluginInstallation( 'migrate-guru', siteId, options ), {
		wrapper: Wrapper( queryClient ),
	} );

	return {
		...renderResult,
		queryClient,
	};
};

describe( 'usePluginInstallation', () => {
	const siteId = 123;

	beforeAll( () => nock.disableNetConnect() );

	it( 'returns success when the installation was completed', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( `/rest/v1.2/sites/${ siteId }/plugins/migrate-guru/install?http_envelope=1` )
			.reply( 200 );

		const { result } = render( { siteId } );
		result.current.mutate();
		await waitFor( () => {
			expect( result.current.isSuccess ).toEqual( true );
		} );
	} );

	it( 'returns error when there is an error to install', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( `/rest/v1.2/sites/${ siteId }/plugins/migrate-guru/install?http_envelope=1` )
			.reply( 200, {
				code: 400,
				headers: [
					{
						name: 'Content-Type',
						value: 'application/json',
					},
				],
				body: {
					error: 'plugin_already_installed',
					message: 'The plugin is already installed',
				},
			} );

		const { result } = render( { siteId } );

		result.current.mutate();

		await waitFor( () => {
			// console.log( result.current );
			expect( result.current.isError ).toEqual( true );
		} );
	} );

	it( 'returns success when the plugin is already installed', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( `/rest/v1.2/sites/${ siteId }/plugins/migrate-guru/install` )
			.reply( 400, { error: 'plugin_already_installed' } );

		const { result } = render( { siteId } );

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isSuccess ).toEqual( true );
		} );
	} );
} );
