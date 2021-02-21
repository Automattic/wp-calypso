/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchAtomicTransfer, setAtomicTransfer, atomicTransferFetchingFailure } from '../actions';
import {
	ATOMIC_TRANSFER_REQUEST as TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE as TRANSFER_REQUEST_FAILURE,
	ATOMIC_TRANSFER_SET as SET_TRANSFER,
} from 'calypso/state/action-types';

describe( 'action', () => {
	describe( 'fetchAtomicTransfer', () => {
		test( 'should return a transfer request action', () => {
			const requestAction = fetchAtomicTransfer( 1 );

			expect( requestAction ).to.eql( {
				type: TRANSFER_REQUEST,
				siteId: 1,
			} );
		} );
	} );

	describe( 'setAtomicTransfer', () => {
		test( 'should return a the a set transfer action object', () => {
			const transfer = { status: 'pending' };
			const setTransferAction = setAtomicTransfer( 1, transfer );

			expect( setTransferAction ).to.eql( {
				type: SET_TRANSFER,
				siteId: 1,
				transfer,
			} );
		} );
	} );

	describe( 'atomicTransferFetchingFailure', () => {
		test( 'should return a failed transfer request action object', () => {
			const failedRequestAction = atomicTransferFetchingFailure( 1 );

			expect( failedRequestAction ).to.eql( {
				type: TRANSFER_REQUEST_FAILURE,
				siteId: 1,
			} );
		} );
	} );
} );
