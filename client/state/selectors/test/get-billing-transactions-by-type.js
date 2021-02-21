/**
 * Internal dependencies
 */
import getBillingTransactionsByType from 'calypso/state/selectors/get-billing-transactions-by-type';

describe( 'getBillingTransactionsByType()', () => {
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
						date: '2016-10-12T11:22:33+0000',
					},
				],
			},
		},
	};

	test( 'should return the past billing transactions', () => {
		const output = getBillingTransactionsByType( state, 'past' );
		expect( output ).toEqual( [
			{
				id: '12345678',
				amount: '$1.23',
				date: '2016-12-12T11:22:33+0000',
			},
		] );
	} );

	test( 'should return the upcoming billing transactions', () => {
		const output = getBillingTransactionsByType( state, 'upcoming' );
		expect( output ).toEqual( [
			{
				id: '87654321',
				amount: '$4.56',
				date: '2016-10-12T11:22:33+0000',
			},
		] );
	} );

	test( 'should return null if billing transactions have not been fetched yet', () => {
		const output = getBillingTransactionsByType(
			{
				billingTransactions: {
					items: {},
				},
			},
			'past'
		);
		expect( output ).toBe( null );
	} );
} );
