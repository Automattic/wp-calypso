/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAutomatedTransferEligibilityWarnings as getWarnings } from '../';

describe( 'getAutomatedTransferEligibilityWarnings()', () => {
	it( 'should return empty array if no data available', () => {
		expect( getWarnings( {}, 2916284 ) ).to.be.deep.equal( [] );
	} );

	it( 'should return warnings from state', () => {
		const eligibilityWarnings = [
			{ name: 'warning 1' },
			{ name: 'warning 2' },
		];

		const result = getWarnings(
			deepFreeze( {
				automatedTransfer: {
					2916284: {
						eligibility: {
							eligibilityWarnings,
						},
					},
				},
			} ),
			2916284
		);
		expect( result ).to.deep.equal( eligibilityWarnings );
	} );
} );
