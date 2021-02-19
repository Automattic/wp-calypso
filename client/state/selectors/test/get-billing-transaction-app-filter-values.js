/**
 * Internal dependencies
 */
import getBillingTransactionAppFilterValues from 'calypso/state/selectors/get-billing-transaction-app-filter-values';

describe( 'getBillingTransactionAppFilterValues()', () => {
	const state = {
		billingTransactions: {
			items: {
				past: [
					{
						service: 'service 1',
					},
					{
						service: 'service 2',
					},
					{
						service: 'service 1',
					},
					{
						service: 'service 3',
					},
					{
						service: 'service 2',
					},
					{
						service: 'service 2',
					},
				],
			},
		},
	};

	test( 'returns transaction app filter values with counts', () => {
		const result = getBillingTransactionAppFilterValues( state, 'past' );
		expect( result ).toEqual( [
			{
				title: 'service 1',
				value: 'service 1',
				count: 2,
			},
			{
				title: 'service 2',
				value: 'service 2',
				count: 3,
			},
			{
				title: 'service 3',
				value: 'service 3',
				count: 1,
			},
		] );
	} );

	test( 'returns an empty array when there are no transactions', () => {
		const result = getBillingTransactionAppFilterValues(
			{
				billingTransactions: {
					items: {},
				},
			},
			'past'
		);
		expect( result ).toEqual( [] );
	} );
} );
