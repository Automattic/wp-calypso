/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { isRequestingBillingTransactions } from '../';

describe( 'isRequestingBillingTransactions()', () => {
	it( 'should return true if the billing transactions are being fetched', () => {
		const state = {
			billingTransactions: {
				requesting: true
			}
		};
		const output = isRequestingBillingTransactions( state );
		expect( output ).to.be.true;
	} );

	it( 'should return false if the billing transactions are currently not being fetched', () => {
		const state = {
			billingTransactions: {
				requesting: false
			}
		};
		const output = isRequestingBillingTransactions( state );
		expect( output ).to.be.false;
	} );

	it( 'should return false if the billing transactions have never been requested', () => {
		const output = isRequestingBillingTransactions( {} );
		expect( output ).to.be.false;
	} );
} );
