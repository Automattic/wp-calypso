/*
 * @jest-environment jsdom
 */
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import nock from 'nock';
import { usePrepareSiteForMigration } from '../use-prepare-site-for-migration';
// Mock dependencies
jest.mock( '@automattic/calypso-config', () => {
	const mock = () => '';
	mock.isEnabled = jest.fn();
	return mock;
} );

jest.mock( 'calypso/lib/logstash', () => ( {
	logToLogstash: jest.fn(),
} ) );

const SITE_ID = 123;
const API_ROOT = 'https://public-api.wordpress.com';

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

describe( 'usePrepareSiteForMigration', () => {
	beforeAll( () => {
		nock.disableNetConnect();
	} );

	beforeEach( () => {
		nock.cleanAll();
	} );

	it( 'should return "idle" when site id is not available', () => {
		const { result } = render( { siteId: undefined } );

		expect( result.current ).toEqual( {
			detailedStatus: {
				siteTransfer: 'idle',
				pluginInstallation: 'idle',
				migrationKey: 'idle',
			},
			softwareTransferCompleted: false,
			error: null,
			migrationKey: null,
		} );
	} );

	it( 'should handle successful migration preparation', async () => {
		nock( API_ROOT )
			.post( '/wpcom/v2/sites/123/atomic/transfer-with-software', {
				plugins: [ 'wpcom-migration', 'activate' ],
				settings: {},
			} )
			.query( { http_envelope: 1 } )
			.reply( 200, {
				transfer_with_software_id: 456,
			} )
			.get( `/wpcom/v2/sites/${ SITE_ID }/transfer-with-software/456` )
			.query( { http_envelope: 1 } )
			.reply( 200, {
				atomic_transfer_status: 'success',
				transfer_with_software_status: 'success',
			} )
			.get( `/wpcom/v2/sites/${ SITE_ID }/migration/key` )
			.query( { http_envelope: 1 } )
			.reply( 200, { migration_key: 'test-key-123' } );

		const { result } = render( { siteId: SITE_ID } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					detailedStatus: {
						siteTransfer: 'success',
						pluginInstallation: 'success',
						migrationKey: 'success',
					},
					softwareTransferCompleted: true,
					error: null,
					migrationKey: 'test-key-123',
				} );
			},
			{ timeout: 3000 }
		);
	} );

	it( 'should handle transfer failure', async () => {
		// Mock transfer initiation
		nock( API_ROOT )
			.post( `/wpcom/v2/sites/${ SITE_ID }/transfer-with-software?http_envelope=1` )
			.reply( 200, { transfer_with_software_id: 456 } );

		// Mock failed transfer status
		nock( API_ROOT )
			.get( `/wpcom/v2/sites/${ SITE_ID }/transfer-with-software/456?http_envelope=1` )
			.reply( 200, {
				atomic_transfer_status: 'error',
				transfer_with_software_status: 'error',
				error: 'Transfer failed',
			} );

		const { result } = render( { siteId: SITE_ID } );

		await waitFor(
			() => {
				expect( result.current ).toEqual( {
					detailedStatus: {
						siteTransfer: 'error',
						pluginInstallation: 'error',
						migrationKey: 'idle',
					},
					softwareTransferCompleted: false,
					error: expect.any( Error ),
					migrationKey: null,
				} );
			},
			{ timeout: 3000 }
		);
	} );
} );
