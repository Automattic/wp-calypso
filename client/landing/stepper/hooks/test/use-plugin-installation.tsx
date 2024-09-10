/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { usePluginInstallation } from '../use-plugin-installation';
import { replyWithSuccess, replyWithError } from './helpers/nock';

const installationWithSuccess = replyWithSuccess( 200 );
const installationWithGenericError = replyWithError( { error: 'any generic error' } );
const installationWithPluginAlreadyInstalled = replyWithError( {
	error: 'plugin_already_installed',
} );

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
			.post( `/rest/v1.2/sites/${ siteId }/plugins/migrate-guru/install` )
			.once()
			.query( { http_envelope: 1 } )
			.reply( installationWithSuccess );

		const { result } = render( { siteId } );
		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isSuccess ).toEqual( true );
		} );
	} );

	it( 'returns error when there is an error to install', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( `/rest/v1.2/sites/${ siteId }/plugins/migrate-guru/install` )
			.query( { http_envelope: 1 } )
			.reply( installationWithGenericError );

		const { result } = render( { siteId } );

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isError ).toBe( true );
		} );
	} );

	it( 'returns success when the plugin is already installed', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.post( `/rest/v1.2/sites/${ siteId }/plugins/migrate-guru/install` )
			.query( { http_envelope: 1 } )
			.reply( installationWithPluginAlreadyInstalled );

		const { result } = render( { siteId } );

		result.current.mutate();

		await waitFor( () => {
			expect( result.current.isSuccess ).toEqual( true );
		} );
	} );
} );
