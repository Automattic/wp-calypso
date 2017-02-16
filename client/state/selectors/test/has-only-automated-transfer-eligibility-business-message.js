/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { hasOnlyAutomatedTransferEligibilityBusinessMessage as hasOnlyBusinessMessage } from '../';

describe( 'hasAutomatedTransferEligibilityMessages()', () => {
	it( 'should return false if no data available', () => {
		expect( hasOnlyBusinessMessage( {}, 2916284 ) ).to.be.false;
	} );

	it( 'should return false if no holds or warnings', () => {
		const eligibility = {
			eligibilityWarnings: [],
			eligibilityHolds: [],
		};

		const result = hasOnlyBusinessMessage(
			deepFreeze( {
				automatedTransfer: {
					2916284: {
						eligibility,
					},
				},
			} ),
			2916284
		);
		expect( result ).to.be.false;
	} );

	it( 'should return false if warnings exist', () => {
		const eligibility = {
			eligibilityWarnings: [
				{ name: 'warning 1' },
				{ name: 'warning 2' },
			],
			eligibilityHolds: [
				'NO_BUSINESS_PLAN',
			]
		};

		const result = hasOnlyBusinessMessage(
			deepFreeze( {
				automatedTransfer: {
					2916284: {
						eligibility,
					},
				},
			} ),
			2916284
		);
		expect( result ).to.be.false;
	} );

	it( 'should return false if other holds exist', () => {
		const eligibility = {
			eligibilityHolds: [
				'NO_BUSINESS_PLAN',
				'SITE_PRIVATE',
			],
		};

		const result = hasOnlyBusinessMessage(
			deepFreeze( {
				automatedTransfer: {
					2916284: {
						eligibility,
					},
				},
			} ),
			2916284
		);
		expect( result ).to.be.false;
	} );

	it( 'should return true if only business hold exists', () => {
		const eligibility = {
			eligibilityHolds: [
				'NO_BUSINESS_PLAN',
			],
		};

		const result = hasOnlyBusinessMessage(
			deepFreeze( {
				automatedTransfer: {
					2916284: {
						eligibility,
					},
				},
			} ),
			2916284
		);
		expect( result ).to.be.true;
	} );
} );
