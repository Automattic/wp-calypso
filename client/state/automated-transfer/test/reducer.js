/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { transferStates } from '../constants';
import { status, fetchingStatus } from '../reducer';
import {
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_REQUEST as REQUEST_STATUS,
	AUTOMATED_TRANSFER_STATUS_REQUEST_FAILURE as REQUEST_STATUS_FAILURE,
	SERIALIZE,
	DESERIALIZE,
} from 'state/action-types';

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

				test( "should never persist whether it's fetching status", () => {
					expect(
						fetchingStatus( true, {
							type: SERIALIZE,
						} )
					).to.be.null;

					expect(
						fetchingStatus( true, {
							type: DESERIALIZE,
						} )
					).to.be.false;
				} );
			} );
		} );
	} );
} );
