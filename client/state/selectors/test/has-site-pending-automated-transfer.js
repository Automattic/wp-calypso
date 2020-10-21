/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import hasSitePendingAutomatedTransfer from 'calypso/state/selectors/has-site-pending-automated-transfer';

describe( 'hasSitePendingAutomatedTransfer()', () => {
	test( 'should return null if the specified site was not found in the state', () => {
		const state = {
			sites: {
				items: {},
			},
		};

		expect( hasSitePendingAutomatedTransfer( state, 12345 ) ).to.be.null;
	} );

	test( 'should return false if site is an Atomic one', () => {
		const state = {
			sites: {
				items: {
					12345: {
						options: {
							is_automated_transfer: true,
							has_pending_automated_transfer: true,
						},
					},
				},
			},
		};

		expect( hasSitePendingAutomatedTransfer( state, 12345 ) ).to.be.false;
	} );

	test( 'should return true if site has the has_pending_automated_transfer option set to true', () => {
		const state = {
			sites: {
				items: {
					12345: {
						options: {
							has_pending_automated_transfer: true,
						},
					},
				},
			},
		};

		expect( hasSitePendingAutomatedTransfer( state, 12345 ) ).to.be.true;
	} );

	test(
		'should return false if site has the has_pending_automated_transfer set to false' +
			' or the site is missing the option key',
		() => {
			const state = {
				sites: {
					items: {
						12345: {
							options: {
								has_pending_automated_transfer: false,
							},
						},
						12346: {
							options: {},
						},
					},
				},
			};

			expect( hasSitePendingAutomatedTransfer( state, 12345 ) ).to.be.false;
			expect( hasSitePendingAutomatedTransfer( state, 12346 ) ).to.be.false;
		}
	);
} );
