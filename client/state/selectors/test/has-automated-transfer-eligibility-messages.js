/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { hasAutomatedTransferEligibilityMessages as hasMessages } from '../';

describe( 'hasAutomatedTransferEligibilityMessages()', () => {
	it( 'should return false if no data available', () => {
		expect( hasMessages( {}, 2916284 ) ).to.be.false;
	} );

	it( 'should return false if no holds or warnings', () => {
		const eligibility = {
			eligibilityWarnings: [],
			eligibilityHolds: [],
		};

		const result = hasMessages(
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

	it( 'should return true if warnings exist', () => {
		const eligibility = {
			eligibilityWarnings: [
				{ name: 'warning 1' },
				{ name: 'warning 2' },
			],
		};

		const result = hasMessages(
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

	it( 'should return true if holds exist', () => {
		const eligibility = {
			eligibilityHolds: [
				'NO_BUSINESS_PLAN',
				'SITE_PRIVATE',
			],
		};

		const result = hasMessages(
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
