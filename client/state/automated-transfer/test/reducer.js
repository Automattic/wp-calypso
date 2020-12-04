/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { transferStates } from '../constants';
import reducer, { status, fetchingStatus } from '../reducer';
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_REQUEST as REQUEST_STATUS,
	AUTOMATED_TRANSFER_STATUS_REQUEST_FAILURE as REQUEST_STATUS_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'calypso/state/action-types';

describe( 'state', () => {
	describe( 'automated-transfer', () => {
		describe( 'reducer', () => {
			describe( 'eligibility', () => {
				const update = { type: ELIGIBILITY_UPDATE };

				test( 'should set inquiring status when first polling eligibility', () => {
					expect( status( null, update ) ).to.equal( transferStates.INQUIRING );
				} );

				test( 'should not overwrite the status when a valid state already exists', () => {
					expect( status( transferStates.START, update ) ).to.equal( transferStates.START );
				} );
			} );

			describe( 'fetchingStatus', () => {
				test( 'should be false when irrelevant action is supplied', () => {
					expect( fetchingStatus( false, { type: ELIGIBILITY_UPDATE } ) ).to.be.false;
				} );

				test( 'should be false when fetching the status is unsuccessful', () => {
					expect( fetchingStatus( true, { type: REQUEST_STATUS_FAILURE } ) ).to.be.false;
				} );

				test( 'should be truthy when fetching transfer status', () => {
					const action = { type: REQUEST_STATUS };

					expect( fetchingStatus( null, action ) ).to.be.true;
				} );
			} );

			test( 'should persist all state keys except fetchingStatus', () => {
				const SITE_ID = 12345;
				const AT_STATE = {
					[ SITE_ID ]: {
						status: 'backfilling',
						eligibility: {
							eligibilityHolds: [],
							eligibilityWarnings: [],
							lastUpdate: 1000000000,
						},
						fetchingStatus: true,
					},
				};

				const serialized = reducer( AT_STATE, { type: SERIALIZE } ).root();
				expect( serialized[ SITE_ID ] ).to.have.property( 'status' );
				expect( serialized[ SITE_ID ] ).to.have.property( 'eligibility' );
				expect( serialized[ SITE_ID ] ).to.not.have.property( 'fetchingStatus' );

				const deserialized = reducer( AT_STATE, { type: DESERIALIZE } );
				expect( deserialized[ SITE_ID ] ).to.have.property( 'status' );
				expect( deserialized[ SITE_ID ] ).to.have.property( 'eligibility' );
				// The non-persisted property has default value, persisted value is ignored
				expect( deserialized[ SITE_ID ] ).to.have.property( 'fetchingStatus', false );
			} );
		} );
	} );
} );
