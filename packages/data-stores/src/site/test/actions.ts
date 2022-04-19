/**
 * @jest-environment jsdom
 */

import { createActions } from '../actions';
import { SiteLaunchError, AtomicTransferError } from '../types';

const client_id = 'magic_client_id';
const client_secret = 'magic_client_secret';
const mockedClientCredentials = { client_id, client_secret };
const siteId = 12345;
const error = SiteLaunchError.INTERNAL;
const atomicTransferError = AtomicTransferError.INTERNAL;

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

		it( 'should request the Atomic transfer status', () => {
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

			// First iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );
		} );

		it( 'should request the Atomic software install status', () => {
			const { requestAtomicSoftwareStatus } = createActions( mockedClientCredentials );
			const softwareSet = 'woo-on-plans';
			const generator = requestAtomicSoftwareStatus( siteId, softwareSet );

			const mockedApiResponse = {
				request: {
					apiNamespace: 'wpcom/v2',
					method: 'GET',
					path: `/sites/${ siteId }/atomic/software/${ softwareSet }`,
				},
				type: 'WPCOM_REQUEST',
			};

			// First iteration: WP_COM_REQUEST is fired
			expect( generator.next().value ).toEqual( mockedApiResponse );
		} );
	} );
} );
