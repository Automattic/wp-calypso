/**
 * External dependencies
 */
import { cloneDeep, slice } from 'lodash';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import getFilteredBillingTransactions from 'state/selectors/get-filtered-billing-transactions';

describe( 'getBillingTransactionAppFilterValues()', () => {
	const PAGE_SIZE = 5;

	const state = {
		billingTransactions: {
			items: {
				past: [
					{
						date: '2018-05-01T12:00:00',
						service: 'WordPress.com',
						cc_name: 'name1 surname1',
						cc_type: 'mastercard',
						items: [
							{
								amount: '$3.50',
								type: 'new purchase',
								variation: 'Variation1',
							},
						],
					},
					{
						date: '2018-04-11T13:11:27',
						service: 'WordPress.com',
						cc_name: 'name2',
						cc_type: 'visa',
						items: [
							{
								amount: '$5.75',
								type: 'new purchase',
								variation: 'Variation2',
							},
							{
								amount: '$8.00',
								type: 'new purchase',
								variation: 'Variation2',
							},
						],
					},
					{
						date: '2018-03-11T21:00:00',
						service: 'Store Services',
						cc_name: 'name1 surname1',
						cc_type: 'visa',
						items: [
							{
								amount: '$3.50',
								type: 'new purchase',
								variation: 'Variation2',
							},
							{
								amount: '$5.00',
								type: 'new purchase',
								variation: 'Variation2',
							},
						],
					},
					{
						date: '2018-03-15T10:39:27',
						service: 'Store Services',
						cc_name: 'name2',
						cc_type: 'mastercard',
						items: [
							{
								amount: '$4.86',
								type: 'new purchase',
								variation: 'Variation1',
							},
							{
								amount: '$1.23',
								type: 'new purchase',
								variation: 'Variation1',
							},
						],
					},
					{
						date: '2018-03-13T16:10:45',
						service: 'WordPress.com',
						cc_name: 'name1 surname1',
						cc_type: 'visa',
						items: [
							{
								amount: '$3.50',
								type: 'new purchase',
								variation: 'Variation1',
							},
						],
					},
					{
						date: '2018-01-10T14:24:38',
						service: 'WordPress.com',
						cc_name: 'name2',
						cc_type: 'mastercard',
						items: [
							{
								amount: '$4.20',
								type: 'new purchase',
								variation: 'Variation2',
							},
						],
					},
					{
						date: '2017-12-10T10:30:38',
						service: 'Store Services',
						cc_name: 'name1 surname1',
						cc_type: 'visa',
						items: [
							{
								amount: '$3.75',
								type: 'new purchase',
								variation: 'Variation1',
							},
						],
					},
					{
						date: '2017-12-01T07:20:00',
						service: 'Store Services',
						cc_name: 'name1 surname1',
						cc_type: 'visa',
						items: [
							{
								amount: '$9.50',
								type: 'new purchase',
								variation: 'Variation1',
							},
						],
					},
					{
						date: '2017-11-24T05:13:00',
						service: 'WordPress.com',
						cc_name: 'name1 surname1',
						cc_type: 'visa',
						items: [
							{
								amount: '$8.40',
								type: 'new purchase',
								variation: 'Variation2',
							},
						],
					},
					{
						date: '2017-01-01T00:00:00',
						service: 'Store Services',
						cc_name: 'name2',
						cc_type: 'mastercard',
						items: [
							{
								amount: '$2.40',
								type: 'new purchase',
								variation: 'Variation1',
							},
						],
					},
				],
			},
		},
		ui: {
			billingTransactions: {},
		},
	};

	describe( 'date filter', () => {
		test( 'returns a page from all transactions when filtering by newest', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				date: { month: null, operator: null },
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result ).toEqual( {
				pageSize: PAGE_SIZE,
				total: 10,
				transactions: slice( state.billingTransactions.items.past, 0, PAGE_SIZE ),
			} );
		} );

		test( 'returns transactions filtered by month', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				date: { month: '2018-03', operator: 'equal' },
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toEqual( 3 );
			expect( result.transactions ).toHaveLength( 3 );
			expect( new Date( result.transactions[ 0 ].date ).getMonth() ).toBe( 2 );
			expect( new Date( result.transactions[ 1 ].date ).getMonth() ).toBe( 2 );
			expect( new Date( result.transactions[ 2 ].date ).getMonth() ).toBe( 2 );
		} );

		test( 'returns transactions before the month set in the filter', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				date: { month: '2017-12', operator: 'before' },
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toEqual( 2 );
			expect( result.transactions ).toHaveLength( 2 );
			expect( new Date( result.transactions[ 0 ].date ).getMonth() ).toBe( 10 );
			expect( new Date( result.transactions[ 1 ].date ).getMonth() ).toBe( 0 );
		} );
	} );

	describe( 'app filter', () => {
		test( 'returns the first page of all transactions when the filter is empty', () => {
			const result = getFilteredBillingTransactions( deepFreeze( state ), 'past' );
			expect( result ).toEqual( {
				pageSize: PAGE_SIZE,
				total: 10,
				transactions: slice( state.billingTransactions.items.past, 0, PAGE_SIZE ),
			} );
		} );

		test( 'returns transactions filtered by app name', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				app: 'Store Services',
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toEqual( 5 );
			expect( result.transactions ).toHaveLength( 5 );
			result.transactions.forEach( ( transaction ) => {
				expect( transaction.service ).toEqual( 'Store Services' );
			} );
		} );
	} );

	describe( 'search query', () => {
		test( 'returns all transactions when the filter is empty', () => {
			const result = getFilteredBillingTransactions( deepFreeze( state ), 'past' );
			expect( result ).toEqual( {
				pageSize: PAGE_SIZE,
				total: 10,
				transactions: slice( state.billingTransactions.items.past, 0, PAGE_SIZE ),
			} );
		} );

		test( 'query matches a field in the root transaction object', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				query: 'mastercard',
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toEqual( 4 );
			expect( result.transactions ).toHaveLength( 4 );
			result.transactions.forEach( ( transaction ) => {
				expect( transaction.cc_type ).toEqual( 'mastercard' );
			} );
		} );

		test( 'query matches date of a transaction', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				query: 'may 1',
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toBe( 1 );
			expect( result.transactions ).toHaveLength( 1 );
			result.transactions.forEach( ( transaction ) => {
				expect( transaction.date ).toBe( '2018-05-01T12:00:00' );
			} );
		} );

		test( 'query matches a field in the transaction items array', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				query: '$3.50',
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toEqual( 3 );
			expect( result.transactions ).toHaveLength( 3 );
			expect( result.transactions[ 0 ].items ).toMatchObject( [ { amount: '$3.50' } ] );
			expect( result.transactions[ 1 ].items ).toMatchObject( [
				{ amount: '$3.50' },
				{ amount: '$5.00' },
			] );
			expect( result.transactions[ 2 ].items ).toMatchObject( [ { amount: '$3.50' } ] );
		} );
	} );

	describe( 'filter combinations', () => {
		test( 'date and app filters', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				date: { month: '2018-03', operator: 'equal' },
				app: 'Store Services',
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toEqual( 2 );
			expect( result.transactions ).toHaveLength( 2 );
			expect( new Date( result.transactions[ 0 ].date ).getMonth() ).toBe( 2 );
			expect( result.transactions[ 0 ].service ).toEqual( 'Store Services' );
			expect( new Date( result.transactions[ 1 ].date ).getMonth() ).toBe( 2 );
			expect( result.transactions[ 1 ].service ).toEqual( 'Store Services' );
		} );

		test( 'app and query filters', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				app: 'Store Services',
				query: '$3.50',
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toEqual( 1 );
			expect( result.transactions ).toHaveLength( 1 );
			expect( result.transactions[ 0 ].items ).toMatchObject( [
				{ amount: '$3.50' },
				{ amount: '$5.00' },
			] );
			expect( result.transactions[ 0 ].service ).toEqual( 'Store Services' );
		} );

		test( 'date and query filters', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				date: { month: '2018-05', operator: 'equal' },
				query: '$3.50',
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toEqual( 1 );
			expect( result.transactions ).toHaveLength( 1 );
			expect( result.transactions[ 0 ].items ).toMatchObject( [ { amount: '$3.50' } ] );
			expect( new Date( result.transactions[ 0 ].date ).getMonth() ).toBe( 4 );
		} );

		test( 'app, date and query filters', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				date: { month: '2018-03', operator: 'equal' },
				query: 'visa',
				app: 'WordPress.com',
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result.total ).toEqual( 1 );
			expect( result.transactions ).toHaveLength( 1 );
			expect( result.transactions[ 0 ].cc_type ).toEqual( 'visa' );
			expect( new Date( result.transactions[ 0 ].date ).getMonth() ).toBe( 2 );
			expect( result.transactions[ 0 ].service ).toEqual( 'WordPress.com' );
		} );
	} );

	describe( 'no results', () => {
		test( 'should return all expected meta fields including an empty transactions array', () => {
			const testState = cloneDeep( state );
			testState.ui.billingTransactions.past = {
				date: { month: '2019-01', operator: 'equal' },
			};
			const result = getFilteredBillingTransactions( deepFreeze( testState ), 'past' );
			expect( result ).toEqual( {
				total: 0,
				pageSize: PAGE_SIZE,
				transactions: [],
			} );
		} );
	} );
} );
