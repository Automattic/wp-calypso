import isRequestingBillingTransactions from 'calypso/state/selectors/is-requesting-billing-transactions';

describe( 'isRequestingBillingTransactions()', () => {
	test( 'should return true if the billing transactions are being fetched', () => {
		const state = {
			billingTransactions: {
				requesting: true,
			},
		};
		const output = isRequestingBillingTransactions( state );
		expect( output ).toBe( true );
	} );

	test( 'should return false if the billing transactions are currently not being fetched', () => {
		const state = {
			billingTransactions: {
				requesting: false,
			},
		};
		const output = isRequestingBillingTransactions( state );
		expect( output ).toBe( false );
	} );

	test( 'should return false if the billing transactions have never been requested', () => {
		const output = isRequestingBillingTransactions( {} );
		expect( output ).toBe( false );
	} );
} );
