/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { getAutomatedTransferEligibilityHolds as getHolds } from '../';

describe( 'getAutomatedTransferEligibilityHolds()', () => {
	it( 'should return empty array if no data available', () => {
		expect( getHolds( {}, 2916284 ) ).to.be.deep.equal( [] );
	} );

	it( 'should return holds from state', () => {
		const eligibilityHolds = [
			'NO_BUSINESS_PLAN',
			'SITE_PRIVATE',
		];

		const result = getHolds(
			deepFreeze( {
				automatedTransfer: {
					2916284: {
						eligibility: {
							eligibilityHolds,
						},
					},
				},
			} ),
			2916284
		);
		expect( result ).to.deep.equal( eligibilityHolds );
	} );
} );
