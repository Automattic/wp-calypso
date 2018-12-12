/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	atomicTransferComplete,
	atomicTransferFetchingFailure,
	fetchAtomicTransfer,
	initiateAtomicTransfer,
	initiateAtomicTransferPluginSlug,
	initiateAtomicTransferPluginZip,
	initiateAtomicTransferThemeZip,
	setAtomicTransfer,
} from '../actions';
import {
	ATOMIC_TRANSFER_COMPLETE,
	ATOMIC_TRANSFER_INITIATE,
	ATOMIC_TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_SET,
} from 'state/action-types';

describe( 'action', () => {
	describe( 'atomicTransferComplete', () => {
		describe( 'should return a completed transfer request action object', () => {
			const failedRequestAction = atomicTransferComplete( 1 );

			expect( failedRequestAction ).to.eql( {
				type: ATOMIC_TRANSFER_COMPLETE,
				siteId: 1,
			} );
		} );
	} );

	describe( 'atomicTransferFetchingFailure', () => {
		describe( 'should return a failed transfer request action object', () => {
			const failedRequestAction = atomicTransferFetchingFailure( 1 );

			expect( failedRequestAction ).to.eql( {
				type: ATOMIC_TRANSFER_REQUEST_FAILURE,
				siteId: 1,
			} );
		} );
	} );

	describe( 'fetchAtomicTransfer', () => {
		test( 'should return a transfer request action', () => {
			const requestAction = fetchAtomicTransfer( 1 );

			expect( requestAction ).to.eql( {
				type: ATOMIC_TRANSFER_REQUEST,
				siteId: 1,
			} );
		} );
	} );

	describe( 'initiateAtomicTransfer', () => {
		test( 'should return an initiate transfer request action', () => {
			const requestAction = initiateAtomicTransfer( 1, { plugin_slug: 'akismet' } );

			expect( requestAction ).to.eql( {
				type: ATOMIC_TRANSFER_INITIATE,
				siteId: 1,
				module: { plugin_slug: 'akismet' },
			} );
		} );
	} );

	describe( 'initiateAtomicTransferPluginSlug', () => {
		test( 'should return an initiate transfer request action with a plugin slug', () => {
			const requestAction = initiateAtomicTransferPluginSlug( 1, 'akismet' );

			expect( requestAction ).to.eql( {
				type: ATOMIC_TRANSFER_INITIATE,
				siteId: 1,
				module: { plugin_slug: 'akismet' },
			} );
		} );
	} );

	describe( 'initiateAtomicTransferPluginZip', () => {
		test( 'should return an initiate transfer request action with a plugin zip upload', () => {
			const requestAction = initiateAtomicTransferPluginZip( 1, { file: '', size: 0 } );

			expect( requestAction ).to.eql( {
				type: ATOMIC_TRANSFER_INITIATE,
				siteId: 1,
				module: {
					plugin_zip: {
						file: '',
						size: 0,
					},
				},
			} );
		} );
	} );

	describe( 'initiateAtomicTransferThemeZip', () => {
		test( 'should return an initiate transfer request action with theme zip upload', () => {
			const requestAction = initiateAtomicTransferThemeZip( 1, { file: '', size: 0 } );

			expect( requestAction ).to.eql( {
				type: ATOMIC_TRANSFER_INITIATE,
				siteId: 1,
				module: {
					theme_zip: {
						file: '',
						size: 0,
					},
				},
			} );
		} );
	} );

	describe( 'setAtomicTransfer', () => {
		test( 'should return a the a set transfer action object', () => {
			const transfer = { status: 'pending' };
			const setTransferAction = setAtomicTransfer( 1, transfer );

			expect( setTransferAction ).to.eql( {
				type: ATOMIC_TRANSFER_SET,
				siteId: 1,
				transfer,
			} );
		} );
	} );
} );
