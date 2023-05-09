import { transferEligibility } from '../reducer';
import { TransferEligibility } from '../types';

describe( 'reducer', () => {
	it( 'returns the correct default state', () => {
		const state = transferEligibility( undefined, { type: 'TEST_ACTION' } );
		expect( state ).toEqual( {} );
	} );

	it( 'keys transfer eligibility by site id', () => {
		let state = {};
		const expectedTransferEligibility: TransferEligibility = {
			errors: [],
			warnings: {
				plugins: [],
				widgets: [],
				subdomain: [],
			},
			is_eligible: false,
		};
		const updatedExpectedTransferEligibility: TransferEligibility = {
			errors: [ { code: '1234', message: 'error 1234' } ],
			warnings: {
				plugins: [],
				widgets: [],
				subdomain: [],
			},
			is_eligible: true,
		};

		state = transferEligibility( state, {
			type: 'TRANSFER_ELIGIBILITY_RECEIVE',
			siteId: 1234,
			transferEligibility: expectedTransferEligibility,
		} );
		expect( state ).toEqual( {
			[ 1234 ]: expectedTransferEligibility,
		} );

		state = transferEligibility( state, {
			type: 'TRANSFER_ELIGIBILITY_RECEIVE',
			siteId: 4321,
			transferEligibility: expectedTransferEligibility,
		} );
		expect( state ).toEqual( {
			[ 1234 ]: expectedTransferEligibility,
			[ 4321 ]: expectedTransferEligibility,
		} );

		state = transferEligibility( state, {
			type: 'TRANSFER_ELIGIBILITY_RECEIVE',
			siteId: 1234,
			transferEligibility: updatedExpectedTransferEligibility,
		} );
		expect( state ).toEqual( {
			[ 1234 ]: updatedExpectedTransferEligibility,
			[ 4321 ]: expectedTransferEligibility,
		} );
	} );
} );
