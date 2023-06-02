import {
	AUTOMATED_TRANSFER_ELIGIBILITY_UPDATE as ELIGIBILITY_UPDATE,
	AUTOMATED_TRANSFER_STATUS_REQUEST as REQUEST_STATUS,
	AUTOMATED_TRANSFER_STATUS_REQUEST_FAILURE as REQUEST_STATUS_FAILURE,
} from 'calypso/state/action-types';
import { serialize, deserialize } from 'calypso/state/utils';
import { transferStates } from '../constants';
import reducer, { status, fetchingStatus } from '../reducer';

describe( 'state', () => {
	describe( 'automated-transfer', () => {
		describe( 'reducer', () => {
			describe( 'eligibility', () => {
				const update = { type: ELIGIBILITY_UPDATE };

				test( 'should set inquiring status when first polling eligibility', () => {
					expect( status( null, update ) ).toEqual( transferStates.INQUIRING );
				} );

				test( 'should not overwrite the status when a valid state already exists', () => {
					expect( status( transferStates.START, update ) ).toEqual( transferStates.START );
				} );
			} );

			describe( 'fetchingStatus', () => {
				test( 'should be false when irrelevant action is supplied', () => {
					expect( fetchingStatus( false, { type: ELIGIBILITY_UPDATE } ) ).toBe( false );
				} );

				test( 'should be false when fetching the status is unsuccessful', () => {
					expect( fetchingStatus( true, { type: REQUEST_STATUS_FAILURE } ) ).toBe( false );
				} );

				test( 'should be truthy when fetching transfer status', () => {
					const action = { type: REQUEST_STATUS };

					expect( fetchingStatus( null, action ) ).toBe( true );
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

				const serialized = serialize( reducer, AT_STATE ).root();
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'status' );
				expect( serialized[ SITE_ID ] ).toHaveProperty( 'eligibility' );
				expect( serialized[ SITE_ID ] ).not.toHaveProperty( 'fetchingStatus' );

				const deserialized = deserialize( reducer, AT_STATE );
				expect( deserialized[ SITE_ID ] ).toHaveProperty( 'status' );
				expect( deserialized[ SITE_ID ] ).toHaveProperty( 'eligibility' );
				// The non-persisted property has default value, persisted value is ignored
				expect( deserialized[ SITE_ID ] ).toHaveProperty( 'fetchingStatus', false );
			} );
		} );
	} );
} );
