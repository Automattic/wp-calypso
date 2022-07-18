/**
 * @jest-environment jsdom
 */

import { createActions } from '../actions';
import {
	SiteLaunchError,
	AtomicTransferError,
	LatestAtomicTransfer,
	LatestAtomicTransferError,
	AtomicSoftwareStatus,
} from '../types';

jest.mock( '@automattic/calypso-config', () => ( {
	isEnabled: () => false,
} ) );

const client_id = 'magic_client_id';
const client_secret = 'magic_client_secret';
const mockedClientCredentials = { client_id, client_secret };
const siteId = 12345;
const error = SiteLaunchError.INTERNAL;
const atomicTransferError = AtomicTransferError.INTERNAL;
const latestAtomicTransferError: LatestAtomicTransferError = {
	name: 'NotFoundError',
	status: 404,
	message: 'Transfer not found',
	code: 'no_transfer_error',
};

describe( 'Site Actions', () => {
	describe( 'LAUNCH_SITE Actions', () => {
		it( 'should return a LAUNCH_SITE_START Action', () => {
			const { launchSiteStart } = createActions( mockedClientCredentials );

			const expected = {
				type: 'LAUNCH_SITE_START',
				siteId,
			};

			expect( launchSiteStart( siteId ) ).toEqual( expected );
		} );

		it( 'should return a LAUNCH_SITE_SUCCESS Action', () => {
			const { launchSiteSuccess } = createActions( mockedClientCredentials );

			const expected = {
				type: 'LAUNCH_SITE_SUCCESS',
				siteId,
			};

			expect( launchSiteSuccess( siteId ) ).toEqual( expected );
		} );

		it( 'should return a LAUNCH_SITE_FAILURE Action', () => {
			const { launchSiteFailure } = createActions( mockedClientCredentials );

			const expected = {
				type: 'LAUNCH_SITE_FAILURE',
				siteId,
				error,
			};

			expect( launchSiteFailure( siteId, error ) ).toEqual( expected );
		} );

		it( 'should launch a site successfully', () => {
			const { launchSite } = createActions( mockedClientCredentials );
			const generator = launchSite( siteId );

			const mockedApiResponse = {
				request: {
					apiVersion: '1.1',
					method: 'post',
					path: `/sites/${ siteId }/launch`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LAUNCH_SITE_IDLE is fired
			expect( generator.next().value ).toEqual( {
				type: 'LAUNCH_SITE_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: LAUNCH_SITE_SUCCESS is fired
			expect( generator.next().value ).toEqual( {
				type: 'LAUNCH_SITE_SUCCESS',
				siteId,
			} );
		} );

		it( 'should fail to launch a site', () => {
			const { launchSite } = createActions( mockedClientCredentials );
			const generator = launchSite( siteId );

			const mockedApiResponse = {
				request: {
					apiVersion: '1.1',
					method: 'post',
					path: `/sites/${ siteId }/launch`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LAUNCH_SITE_IDLE is fired
			expect( generator.next().value ).toEqual( {
				type: 'LAUNCH_SITE_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: Throw an error
			expect( generator.throw( error ).value ).toEqual( {
				type: 'LAUNCH_SITE_FAILURE',
				siteId,
				error,
			} );

			// Fourth iteration: Complete the cycle
			const finalResult = generator.next();

			expect( finalResult.value ).toBeFalsy();
			expect( finalResult.done ).toBe( true );
		} );
	} );

	describe( 'Atomic Actions', () => {
		it( 'should return a ATOMIC_TRANSFER_START Action', () => {
			const { atomicTransferStart } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';

			const expected = {
				type: 'ATOMIC_TRANSFER_START',
				siteId,
				softwareSet,
			};

			expect( atomicTransferStart( siteId, softwareSet ) ).toEqual( expected );
		} );

		it( 'should return a ATOMIC_TRANSFER_SUCCESS Action', () => {
			const { atomicTransferSuccess } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';

			const expected = {
				type: 'ATOMIC_TRANSFER_SUCCESS',
				siteId,
				softwareSet,
			};

			expect( atomicTransferSuccess( siteId, softwareSet ) ).toEqual( expected );
		} );

		it( 'should return a ATOMIC_TRANSFER_FAILURE Action', () => {
			const { atomicTransferFailure } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';

			const expected = {
				type: 'ATOMIC_TRANSFER_FAILURE',
				siteId,
				softwareSet,
				error: atomicTransferError,
			};

			expect( atomicTransferFailure( siteId, softwareSet, atomicTransferError ) ).toEqual(
				expected
			);
		} );

		it( 'should start an Atomic transfer', () => {
			const { initiateAtomicTransfer } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';
			const generator = initiateAtomicTransfer( siteId, softwareSet );

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					path: `/sites/${ siteId }/atomic/transfers`,
					body: { software_set: softwareSet },
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: ATOMIC_TRANSFER_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_TRANSFER_START',
				siteId,
				softwareSet,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: ATOMIC_TRANSFER_SUCCESS is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_TRANSFER_SUCCESS',
				siteId,
				softwareSet,
			} );
		} );
		it( 'should fail to transfer a site to Atomic', () => {
			const { initiateAtomicTransfer } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';
			const generator = initiateAtomicTransfer( siteId, softwareSet );

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					path: `/sites/${ siteId }/atomic/transfers`,
					body: { software_set: softwareSet },
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: ATOMIC_TRANSFER_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_TRANSFER_START',
				siteId,
				softwareSet,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: ATOMIC_TRANSFER_FAILURE is fired
			expect( generator.throw( atomicTransferError ).value ).toEqual( {
				type: 'ATOMIC_TRANSFER_FAILURE',
				siteId,
				softwareSet,
				error: atomicTransferError,
			} );
		} );

		it( 'should request succesfully the Atomic transfer status', () => {
			const { requestLatestAtomicTransfer } = createActions( mockedClientCredentials );
			const generator = requestLatestAtomicTransfer( siteId );
			const transfer: LatestAtomicTransfer = {
				atomic_transfer_id: 123,
				blog_id: 12345,
				status: 'SUCCESS',
				created_at: 'now',
				is_stuck: false,
				is_stuck_reset: false,
				in_lossless_revert: false,
			};

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ siteId }/atomic/transfers/latest`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LATEST_ATOMIC_TRANSFER_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'LATEST_ATOMIC_TRANSFER_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: ATOMIC_TRANSFER_SUCCESS is fired
			expect( generator.next( transfer ).value ).toEqual( {
				type: 'LATEST_ATOMIC_TRANSFER_SUCCESS',
				siteId,
				transfer,
			} );
		} );

		it( 'should request the Atomic transfer status and fail', () => {
			const { requestLatestAtomicTransfer } = createActions( mockedClientCredentials );
			const generator = requestLatestAtomicTransfer( siteId );

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ siteId }/atomic/transfers/latest`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: LATEST_ATOMIC_TRANSFER_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'LATEST_ATOMIC_TRANSFER_START',
				siteId,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: LATEST_ATOMIC_TRANSFER_FAILURE is fired
			expect( generator.throw( latestAtomicTransferError ).value ).toEqual( {
				type: 'LATEST_ATOMIC_TRANSFER_FAILURE',
				siteId,
				error: latestAtomicTransferError,
			} );
		} );

		it( 'should request the Atomic software install status succesfully', () => {
			const { requestAtomicSoftwareStatus } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';
			const generator = requestAtomicSoftwareStatus( siteId, softwareSet );
			const status: AtomicSoftwareStatus = {
				blog_id: 123,
				software_set: {
					test: { path: '/valid_path.php', state: 'activate' },
				},
				applied: false,
			};

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ siteId }/atomic/software/${ softwareSet }`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_SOFTWARE_STATUS_START',
				siteId,
				softwareSet,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: LATEST_ATOMIC_TRANSFER_SUCCESS is fired
			expect( generator.next( status ).value ).toEqual( {
				type: 'ATOMIC_SOFTWARE_STATUS_SUCCESS',
				siteId,
				softwareSet,
				status,
			} );
		} );
		it( 'should start an Atomic software install', () => {
			const { initiateSoftwareInstall } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';
			const generator = initiateSoftwareInstall( siteId, softwareSet );

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'POST',
					path: `/sites/${ siteId }/atomic/software/${ softwareSet }`,
					body: {},
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: ATOMIC_SOFTWARE_INSTALL_START is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_SOFTWARE_INSTALL_START',
				siteId,
				softwareSet,
			} );

			// Second iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );

			// Third iteration: ATOMIC_SOFTWARE_INSTALL_SUCCESS is fired
			expect( generator.next().value ).toEqual( {
				type: 'ATOMIC_SOFTWARE_INSTALL_SUCCESS',
				siteId,
				softwareSet,
			} );
		} );
	} );
} );
