/**
 * External dependencies
 */
import { clone } from 'lodash';

/**
 * Internal dependencies
 */
import getPastBillingTransaction from 'calypso/state/selectors/get-past-billing-transaction';

describe( 'getPastBillingTransaction()', () => {
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

	test( 'should return the billing transaction data for a known transaction', () => {
		const output = getPastBillingTransaction( state, '12345678' );
		expect( output ).toEqual( state.billingTransactions.items.past[ 0 ] );
	} );

	test( 'should return null for an unknown billing transaction', () => {
		const output = getPastBillingTransaction( state, '87654321' );
		expect( output ).toBeNull();
	} );

	test( 'should return null if billing transactions have not been fetched yet', () => {
		const output = getPastBillingTransaction(
			{
				billingTransactions: {
					items: {},
				},
			},
			'12345678'
		);
		expect( output ).toBeNull();
	} );

	test( 'should return a billing transaction that has been fetched individually', () => {
		const individualTransaction = {
			id: '999999',
			amount: '$1.23',
			date: '2017-01-01T11:22:33+0000',
		};

		const testState = clone( state );
		testState.billingTransactions.individualTransactions = {
			999999: { data: individualTransaction },
		};

		const output = getPastBillingTransaction( testState, 999999 );
		expect( output ).toBe( individualTransaction );
	} );

	test( 'should return null for individual transaction that is being fetched', () => {
		const testState = clone( state );
		testState.billingTransactions.individualTransactions = {
			999999: { requesting: true },
		};

		const output = getPastBillingTransaction( testState, 999999 );
		expect( output ).toBeNull();
	} );

	test( 'should return null for individual transaction that failed to fetch', () => {
		const testState = clone( state );
		testState.billingTransactions.individualTransactions = {
			999999: { error: true },
		};

		const output = getPastBillingTransaction( testState, 999999 );
		expect( output ).toBeNull();
	} );
} );
