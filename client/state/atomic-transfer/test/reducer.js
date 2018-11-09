/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer, { fetchingTransfer } from '../reducer';
import {
	SERIALIZE,
	DESERIALIZE,
	ATOMIC_TRANSFER_REQUEST as TRANSFER_REQUEST,
	ATOMIC_TRANSFER_REQUEST_FAILURE as TRANSFER_REQUEST_FAILURE,
} from 'state/action-types';

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

			test( 'should persist all state keys except fetchingStatus', () => {
				const SITE_ID = 12345;
				const AT_STATE = {
					[ SITE_ID ]: {
						status: 'backfilling',
					},
				};

				const serialized = reducer( AT_STATE, { type: SERIALIZE } );
				expect( serialized[ SITE_ID ] ).to.have.property( 'status' );

				const deserialized = reducer( AT_STATE, { type: DESERIALIZE } );
				expect( deserialized[ SITE_ID ] ).to.have.property( 'status' );
			} );
		} );
	} );
} );
