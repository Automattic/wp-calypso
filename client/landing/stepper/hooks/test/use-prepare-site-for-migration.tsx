/**
 * @jest-environment jsdom
 */
// @ts-nocheck - TODO: Fix TypeScript issues
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import React from 'react';
import { usePrepareSiteForMigration } from '../use-prepare-site-for-migration';
import { replyWithError, replyWithSuccess } from './helpers/nock';

jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
} );

const TRANSFER_ACTIVE = ( siteId: number ) => ( {
	atomic_transfer_id: '1253811',
	blog_id: siteId,
	status: 'active',
} );

const TRANSFER_COMPLETED = ( siteId: number ) => ( {
	atomic_transfer_id: '1254451',
	blog_id: siteId,
	status: 'completed',
} );

jest.mock( 'calypso/lib/analytics/tracks' );
jest.mock( 'calypso/lib/logstash' );

const errorCaptureMigrationKey = replyWithError( {
	error: 'anyError',
} );

describe( 'usePrepareSiteForMigrationWithMigrateGuru', () => {
	beforeAll( () => nock.disableNetConnect() );
	beforeEach( () => nock.cleanAll() );

	const Wrapper =
		( queryClient: QueryClient ) =>
		( { children } ) => (
			<QueryClientProvider client={ queryClient }>{ children }</QueryClientProvider>
		);

	const render = ( { siteId } ) => {
		const queryClient = new QueryClient();

		const renderResult = renderHook( () => usePrepareSiteForMigration( siteId ), {
			wrapper: Wrapper( queryClient ),
		} );

		return {
			...renderResult,
			queryClient,
		};
	};

	it( 'returns idle states when site id is not available', () => {
		const { result } = render( { siteId: undefined } );

		expect( result.current ).toEqual( {
			completed: false,
			error: null,
			detailedStatus: {
				migrationKey: 'idle',
				pluginInstallation: 'idle',
				siteTransfer: 'idle',
			},
			migrationKey: null,
		} );
	} );

	it( 'returns siteTransfer status as "pending" when siteTransfer is still happening', () => {
		const siteId = 123;
		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_ACTIVE( siteId ) );

		const { result } = render( { siteId: 123 } );

		expect( result.current ).toEqual( {
			completed: false,
			error: null,
			detailedStatus: {
				migrationKey: 'idle',
				pluginInstallation: 'idle',
				siteTransfer: 'pending',
			},
			migrationKey: null,
		} );
	} );

	it( 'gets the migration key after the plugin installation', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.reply( 200, TRANSFER_COMPLETED( siteId ) )
			.get( `/rest/v1.2/sites/${ siteId }/plugins?http_envelope=1` )
			.reply( 200, { plugins: [] } )
			.post( `/rest/v1.2/sites/${ siteId }/plugins/wpcom-migration/install?http_envelope=1` )
			.reply( replyWithSuccess() )
			.post( `/rest/v1.2/sites/${ siteId }/plugins/wpcom-migration%2Fwpcom_migration` )
			.reply( replyWithSuccess() )
			.get( `/wpcom/v2/sites/${ siteId }/atomic-migration-status/wpcom-migration-key` )
			.query( { http_envelope: 1 } )
			.reply( replyWithSuccess( { migration_key: 'some-migration-key' } ) );

		const { result } = render( { siteId: 123 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					completed: true,
					error: null,
					detailedStatus: {
						migrationKey: 'success',
						pluginInstallation: 'success',
						siteTransfer: 'success',
					},
					migrationKey: 'some-migration-key',
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'returns error when is not possible to get the migration key', async () => {
		const siteId = 123;

		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.reply( 200, TRANSFER_COMPLETED( siteId ) )
			.get( `/rest/v1.2/sites/${ siteId }/plugins?http_envelope=1` )
			.reply( 200, { plugins: [] } )
			.post( `/rest/v1.2/sites/${ siteId }/plugins/wpcom-migration/install?http_envelope=1` )
			.reply( replyWithSuccess() )
			.post( `/rest/v1.2/sites/${ siteId }/plugins/wpcom-migration%2Fwpcom_migration` )
			.reply( 200 )
			.get( `/wpcom/v2/sites/${ siteId }/atomic-migration-status/wpcom-migration-key` )
			.reply( errorCaptureMigrationKey );

		const { result } = render( { siteId: 123 } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					completed: true,
					error: expect.any( Error ),
					detailedStatus: {
						migrationKey: 'error',
						pluginInstallation: 'success',
						siteTransfer: 'success',
					},
					migrationKey: null,
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'starts the plugin installation after the siteTransfer is completed', async () => {
		const siteId = 123;
		nock( 'https://public-api.wordpress.com:443' )
			.get( `/wpcom/v2/sites/${ siteId }/atomic/transfers/latest` )
			.once()
			.reply( 200, TRANSFER_COMPLETED( siteId ) );

		const { result } = render( { siteId: 123 } );

		await waitFor( () => {
			expect( result.current ).toEqual( {
				completed: false,
				error: null,
				detailedStatus: {
					migrationKey: 'idle',
					pluginInstallation: 'pending',
					siteTransfer: 'success',
				},
				migrationKey: null,
			} );
		} );
	} );
} );
