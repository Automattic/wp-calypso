/**
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { useSiteMigrationStatus } from '../use-site-migration-status';

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

const render = ( { siteId } ) => {
	const queryClient = new QueryClient();

	const renderResult = renderHook( () => useSiteMigrationStatus( PLUGIN, siteId ), {
		wrapper: Wrapper( queryClient ),
	} );

	return {
		...renderResult,
		queryClient,
	};
};

describe( 'useSiteMigrationStatus', () => {
	beforeAll( () => nock.disableNetConnect() );

	it( 'returns the initial status', async () => {
		const siteId = 123;
		const { result } = render( { siteId: 123 } );

		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( siteId ) )
			.delay( 100 )
			.once();

		await waitFor( () => {
			expect( result.current ).toEqual( {
				activation: 'idle',
				installation: 'idle',
				provisionning: 'pending',
				error: null,
				completed: false,
			} );
		} );
	} );

	it( 'returns the plugin installation status', async () => {
		const siteId = 456;

		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( siteId ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( siteId ) )
			.delay( 100 )
			.once()
			.reply( 200 );

		const { result } = render( { siteId: 456 } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				activation: 'idle',
				installation: 'pending',
				provisionning: 'success',
				error: null,
				completed: false,
			} );
		} );
	} );

	it( 'returns the plugin activation status', async () => {
		const siteId = 111;
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( siteId ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( siteId ) )
			.reply( 200 )
			.post( getPluginActivationEndpoint( siteId ) )
			.delay( 100 )
			.reply( 200 );

		const { result } = render( { siteId } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				activation: 'pending',
				installation: 'success',
				provisionning: 'success',
				error: null,
				completed: false,
			} );
		} );
	} );

	it( 'returns completed when all requests was completed', async () => {
		const siteId = 111;
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( siteId ) )
			.once()
			.reply( 200, { plugins: [] } )
			.post( getPluginInstallationEndpoint( siteId ) )
			.reply( 200 )
			.post( getPluginActivationEndpoint( siteId ) )
			.reply( 200 );

		const { result } = render( { siteId } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				activation: 'success',
				installation: 'success',
				provisionning: 'success',
				error: null,
				completed: true,
			} );
		} );
	} );

	it( 'returns installation skipped  when the installation is not necessary', async () => {
		const siteId = 111;
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( siteId ) )
			.once()
			.reply( 200, { plugins: [ { ...PLUGIN, active: false } ] } );

		const { result } = render( { siteId } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				installation: 'skipped',
				activation: 'pending',
				provisionning: 'success',
				error: null,
				completed: false,
			} );
		} );
	} );

	it( 'returns activation skipped when the activation is not necessary', async () => {
		const siteId = 111;
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( siteId ) )
			.once()
			.reply( 200, { plugins: [ { ...PLUGIN, active: true } ] } );

		const { result } = render( { siteId } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				installation: 'skipped',
				activation: 'skipped',
				provisionning: 'success',
				error: null,
				completed: true,
			} );
		} );
	} );

	it( 'returns completed when all steps was skipped or completed with success', async () => {
		const siteId = 111;
		nock( 'https://public-api.wordpress.com:443' )
			.get( getSitePluginsEndpoint( siteId ) )
			.once()
			.reply( 200, { plugins: [ { ...PLUGIN, active: true } ] } );

		const { result } = render( { siteId } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				installation: 'skipped',
				activation: 'skipped',
				provisionning: 'success',
				error: null,
				completed: true,
			} );
		} );
	} );
} );
