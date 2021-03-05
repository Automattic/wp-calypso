/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { fetchingTransfer } from '../reducer';
import {
	ATOMIC_TRANSFER_REQUEST as TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE as TRANSFER_REQUEST_FAILURE,
} from 'calypso/state/action-types';

describe( 'state', () => {
	describe( 'atomic-transfer', () => {
		describe( 'reducer', () => {
			describe( 'fetchingTransfer', () => {
				test( 'should be false when irrelevant action is supplied', () => {
					expect( fetchingTransfer( false, { type: 'RANDOM_ACTION' } ) ).to.be.false;
				} );

				test( 'should be false when fetching the status is unsuccessful', () => {
					expect( fetchingTransfer( true, { type: TRANSFER_REQUEST_FAILURE } ) ).to.be.false;
				} );

				test( 'should be truthy when fetching transfer status', () => {
					const action = { type: TRANSFER_REQUEST };

					expect( fetchingTransfer( null, action ) ).to.be.true;
				} );
			} );
		} );
	} );
} );
