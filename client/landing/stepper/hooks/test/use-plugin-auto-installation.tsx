/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { usePluginAutoInstallation } from '../use-plugin-auto-installation';

const Wrapper =
	( queryClient: QueryClient ) =>
	( { children } ) => {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

const PLUGIN = { name: 'migrate-guru/migrateguru', slug: 'migrate-guru' };
const getSitePluginsEndpoint = ( siteId: number ) =>
	`/rest/v1.2/sites/${ siteId }/plugins?http_envelope=1`;

const getPluginInstallationEndpoint = ( siteId: number ) =>
	`/rest/v1.2/sites/${ siteId }/plugins/migrate-guru/install`;

const getPluginActivationEndpoint = ( siteId: number ) =>
	`/rest/v1.2/sites/${ siteId }/plugins/migrate-guru%2Fmigrateguru`;

const SITE_ID = 123;

const render = ( { retry = 0 } = {} ) => {
	const queryClient = new QueryClient();

	queryClient.setDefaultOptions( { queries: { retry } } );
	const renderResult = renderHook( () => usePluginAutoInstallation( PLUGIN, SITE_ID, { retry } ), {
		wrapper: Wrapper( queryClient ),
	} );

	return {
		...renderResult,
		queryClient,
	};
};

describe( 'usePluginAutoInstallation', () => {
	beforeAll( () => nock.disableNetConnect() );
	beforeEach( () => nock.cleanAll() );

	it( 'returns success when the plugin is already installed and activated', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.reply( 200, { plugins: [ { ...PLUGIN, active: true } ] } );

		const { result } = render();

		await waitFor( () => {
			expect( result.current ).toEqual( {
				status: 'success',
				error: null,
				completed: true,
			} );
		} );
	} );

	it( 'returns pending when the the retrying to fetch the plugin list after an error', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( siteId ) )
			.times( 2 )
			.reply( 500, new Error( 'Error fetching plugins list' ) );

		const { result } = render( { retry: 1 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					status: 'pending',
					error: null,
					completed: false,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns pending when is retrying install the plugin', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( SITE_ID ) )
			.reply( 500, new Error( 'Error installing plugin' ) );

		const { result } = render( { retry: 2 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					status: 'pending',
					error: null,
					completed: false,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns pending when is retrying to active plugin', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( SITE_ID ) )
			.reply( 200 )
			.post( getPluginActivationEndpoint( SITE_ID ) )
			.reply( 500, new Error( 'Error activating plugin' ) );

		const { result } = render( { retry: 2 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					status: 'pending',
					error: null,
					completed: false,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns completed when all steps are successful', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( SITE_ID ) )
			.reply( 200 )
			.post( getPluginActivationEndpoint( SITE_ID ) )
			.reply( 200 );

		const { result } = render( { retry: 2 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					status: 'success',
					error: null,
					completed: true,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns error after all fetching plugin list retries failed', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.times( 2 )
			.reply( 500, new Error( 'Error fetching plugins list' ) );

		const { result } = render( { retry: 1 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					status: 'error',
					error: expect.any( Error ),
					completed: false,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns error after all fetching plugin installation retries', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( SITE_ID ) )
			.reply( 200 )
			.post( getPluginActivationEndpoint( SITE_ID ) )
			.reply( 500, new Error( 'Error activating plugin' ) );

		const { result } = render( { retry: 1 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					status: 'error',
					error: expect.any( Error ),
					completed: false,
				} );
			},
			{ timeout: 3000 }
		);
	} );
} );
