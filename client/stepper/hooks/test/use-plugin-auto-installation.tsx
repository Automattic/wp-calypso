/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { logToLogstash } from 'calypso/lib/logstash';
import { usePluginAutoInstallation } from '../use-plugin-auto-installation';
import { replyWithEnvelope } from './helpers/nock';

const Wrapper =
	( queryClient: QueryClient ) =>
	( { children } ) => {
		return <QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>;
	};

const PLUGIN = { name: 'migrate-guru/migrateguru', slug: 'migrate-guru' };
const getSitePluginsEndpoint = ( siteId: number ) =>
	`/rest/v1.2/sites/${ siteId }/plugins?http_envelope=1`;

const getJetpackReconnectionEndpoint = ( siteId: number ) =>
	`/rest/v1.2/sites/${ siteId }/migration-force-reconnection`;

const getPluginInstallationEndpoint = ( siteId: number ) =>
	`/rest/v1.2/sites/${ siteId }/plugins/migrate-guru/install?http_envelope=1`;

const getPluginActivationEndpoint = ( siteId: number ) =>
	`/rest/v1.2/sites/${ siteId }/plugins/migrate-guru%2Fmigrateguru`;

const SITE_ID = 123;

const render = ( { retry = 0, enabled = true } = {} ) => {
	const queryClient = new QueryClient();

	const renderResult = renderHook(
		() => usePluginAutoInstallation( PLUGIN, SITE_ID, { retry, enabled } ),
		{
			wrapper: Wrapper( queryClient ),
		}
	);

	return {
		...renderResult,
		queryClient,
	};
};
const installationWithSuccess = replyWithEnvelope( 200 );
const installationWithGenericError = replyWithEnvelope( 400, { error: 'any error' } );
jest.mock( 'calypso/lib/logstash' );

describe( 'usePluginAutoInstallation', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );
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

	it( 'returns status "pending" when a retry is required to get the plugin list', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( siteId ) )
			.times( 4 )
			.reply( 500, new Error( 'Error fetching plugins list' ) );

		const { result } = render( { retry: 4 } );

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

	it( 'returns "pending" when a retry is required to install a plugin', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( SITE_ID ) )
			.reply( installationWithGenericError() );
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

	it( 'returns "pending" when a retry is required to active a plugin', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( SITE_ID ) )
			.reply( installationWithSuccess() )
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

	it( 'returns completed and status success when all steps are successful', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( SITE_ID ) )
			.reply( installationWithSuccess() )
			.post( getPluginActivationEndpoint( SITE_ID ) )
			.reply( 200 );

		const { result } = render( { retry: 0 } );

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

		nock( 'https://public-api.wordpress.com:443' )
			.post( getJetpackReconnectionEndpoint( SITE_ID ) )
			.reply( 200 )
			.persist();

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

	it( 'refresh the jetpack connnection after all plugin list retries', async () => {
		// First 3 calls to get the plugins list will fail
		// The reconnection endpoint will be called after the 3rd failure
		// The 4th call to get the plugins list will succeed
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.times( 3 )
			.reply( 500, new Error( 'Error fetching plugins list' ) )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.reply( 200, { plugins: [ { ...PLUGIN, active: true } ] } );

		const refreshtokenCall = nock( 'https://public-api.wordpress.com:443' )
			.post( getJetpackReconnectionEndpoint( SITE_ID ) )
			.once()
			.reply( 200 );

		const { result } = render( { retry: 2 } );

		await waitFor(
			() => {
				expect( refreshtokenCall.isDone() ).toBe( true );
				expect( result.current ).toEqual( {
					status: 'success',
					error: null,
					completed: true,
				} );

				expect( logToLogstash ).toHaveBeenCalledWith(
					expect.objectContaining( { message: 'restoring jetpack connection' } )
				);
				expect( logToLogstash ).toHaveBeenCalledWith(
					expect.objectContaining( { message: 'jetpack connection restored' } )
				);
			},
			{ timeout: 3000 }
		);
	} );

	it( 'logs to logstash when all jetpack connection were exhausted', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.times( 9 )
			.reply( 500, new Error( 'Error fetching plugins list' ) );

		nock( 'https://public-api.wordpress.com:443' )
			.post( getJetpackReconnectionEndpoint( SITE_ID ) )
			.times( 3 )
			.reply( 200 );

		render( { retry: 1 } );

		await waitFor(
			() => {
				expect( logToLogstash ).toHaveBeenCalledWith(
					expect.objectContaining( { message: 'jetpack connection restoration attempts failed' } )
				);
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns error after all installation retries', async () => {
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( SITE_ID ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( SITE_ID ) )
			.times( 4 )
			.reply( installationWithGenericError )
			.post( getPluginActivationEndpoint( SITE_ID ) )
			.reply( 200 );

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

	it( "doesn't start the operation when the enabled is set to false", async () => {
		const { result } = render( { enabled: false } );

		expect( result.current ).toEqual( {
			status: 'idle',
			error: null,
			completed: false,
		} );
	} );
} );
