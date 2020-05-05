/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import getUpcomingBillingTransactions from 'state/selectors/get-upcoming-billing-transactions';

describe( 'getUpcomingBillingTransactions()', () => {
	test( 'should return the upcoming billing transactions', () => {
		const state = {
			billingTransactions: {
				items: {
					past: [
						{
							id: '12345678',
							amount: '$1.23',
							date: '2016-12-12T11:22:33+0000',
						},
					],
					upcoming: [
						{
							id: '87654321',
							amount: '$4.56',
							date: '2016-13-12T11:22:33+0000',
						},
					],
				},
			},
		};
		const expected = state.billingTransactions.items.upcoming.map( ( transaction ) => {
			transaction.date = new Date( transaction.date );
			return transaction;
		} );
		const output = getUpcomingBillingTransactions( state );
		expect( output ).to.eql( expected );
	} );

	test( 'should return null if billing transactions have not been fetched yet', () => {
		const output = getUpcomingBillingTransactions( {
			billingTransactions: {
				items: {},
			},
		} );
		expect( output ).to.be.null;
	} );
} );
