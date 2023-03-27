import { cloneDeep } from 'lodash';
import { BillingTransaction } from 'calypso/state/billing-transactions/types';
import getBillingTransactionFilters from 'calypso/state/selectors/get-billing-transaction-filters';
import { filterTransactions } from 'calypso/state/selectors/get-filtered-billing-transactions';

const PAGE_SIZE = 5;

const mockTransaction: BillingTransaction = {
	address: '',
	amount: '',
	tax_country_code: '',
	cc_email: '',
	cc_name: '',
	cc_num: '',
	cc_type: '',
	credit: '',
	date: '',
	desc: '',
	icon: '',
	id: '',
	items: [],
	org: '',
	pay_part: '',
	pay_ref: '',
	service: '',
	subtotal: '',
	support: '',
	tax: '',
	url: '',
};

const mockItem = {
	id: '',
	type: '',
	type_localized: '',
	domain: '',
	site_id: '',
	subtotal: '',
	tax: '',
	amount: '',
	raw_subtotal: 0,
	raw_tax: 0,
	raw_amount: 0,
	currency: '',
	licensed_quantity: null,
	new_quantity: null,
	product: '',
	product_slug: '',
	variation: '',
	variation_slug: '',
	months_per_renewal_interval: 0,
	wpcom_product_slug: '',
};

const past: BillingTransaction[] = [
	{
		...mockTransaction,
		date: '2018-05-01T12:00:00',
		service: 'WordPress.com',
		cc_name: 'name1 surname1',
		cc_type: 'mastercard',
		items: [
			{
				...mockItem,
				amount: '$3.50',
				type: 'new purchase',
				variation: 'Variation1',
			},
		],
	},
	{
		...mockTransaction,
		date: '2018-04-11T13:11:27',
		service: 'WordPress.com',
		cc_name: 'name2',
		cc_type: 'visa',
		items: [
			{
				...mockItem,
				amount: '$5.75',
				type: 'new purchase',
				variation: 'Variation2',
			},
			{
				...mockItem,
				amount: '$8.00',
				type: 'new purchase',
				variation: 'Variation2',
			},
		],
	},
	{
		...mockTransaction,
		date: '2018-03-11T21:00:00',
		service: 'Store Services',
		cc_name: 'name1 surname1',
		cc_type: 'visa',
		items: [
			{
				...mockItem,
				amount: '$3.50',
				type: 'new purchase',
				variation: 'Variation2',
			},
			{
				...mockItem,
				amount: '$5.00',
				type: 'new purchase',
				variation: 'Variation2',
			},
		],
	},
	{
		...mockTransaction,
		date: '2018-03-15T10:39:27',
		service: 'Store Services',
		cc_name: 'name2',
		cc_type: 'mastercard',
		items: [
			{
				...mockItem,
				amount: '$4.86',
				type: 'new purchase',
				variation: 'Variation1',
			},
			{
				...mockItem,
				amount: '$1.23',
				type: 'new purchase',
				variation: 'Variation1',
			},
		],
	},
	{
		...mockTransaction,
		date: '2018-03-13T16:10:45',
		service: 'WordPress.com',
		cc_name: 'name1 surname1',
		cc_type: 'visa',
		items: [
			{
				...mockItem,
				amount: '$3.50',
				type: 'new purchase',
				variation: 'Variation1',
			},
		],
	},
	{
		...mockTransaction,
		date: '2018-01-10T14:24:38',
		service: 'WordPress.com',
		cc_name: 'name2',
		cc_type: 'mastercard',
		items: [
			{
				...mockItem,
				amount: '$4.20',
				type: 'new purchase',
				variation: 'Variation2',
			},
		],
	},
	{
		...mockTransaction,
		date: '2017-12-10T10:30:38',
		service: 'Store Services',
		cc_name: 'name1 surname1',
		cc_type: 'visa',
		items: [
			{
				...mockItem,
				amount: '$3.75',
				type: 'new purchase',
				variation: 'Variation1',
			},
		],
	},
	{
		...mockTransaction,
		date: '2017-12-01T07:20:00',
		service: 'Store Services',
		cc_name: 'name1 surname1',
		cc_type: 'visa',
		items: [
			{
				...mockItem,
				amount: '$9.50',
				type: 'new purchase',
				variation: 'Variation1',
			},
		],
	},
	{
		...mockTransaction,
		date: '2017-11-24T05:13:00',
		service: 'WordPress.com',
		cc_name: 'name1 surname1',
		cc_type: 'visa',
		items: [
			{
				...mockItem,
				amount: '$8.40',
				type: 'new purchase',
				variation: 'Variation2',
			},
		],
	},
	{
		...mockTransaction,
		date: '2017-01-01T00:00:00',
		service: 'Store Services',
		cc_name: 'name2',
		cc_type: 'mastercard',
		items: [
			{
				...mockItem,
				amount: '$2.40',
				type: 'new purchase',
				variation: 'Variation1',
			},
		],
	},
];

const state = {
	billingTransactions: {
		items: {
			past,
		},
		ui: { past: undefined, upcoming: undefined },
	},
};

describe( 'filterTransactions()', () => {
	describe( 'date filter', () => {
		test( 'returns a page from all transactions when filtering by newest', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				date: { month: null, operator: null },
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( result ).toEqual( state.billingTransactions.items.past.slice( 0, PAGE_SIZE ) );
		} );

		test( 'returns transactions filtered by month', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				date: { month: '2018-03', operator: 'equal' },
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( result ).toHaveLength( 3 );
			expect( new Date( result[ 0 ].date ).getMonth() ).toBe( 2 );
			expect( new Date( result[ 1 ].date ).getMonth() ).toBe( 2 );
			expect( new Date( result[ 2 ].date ).getMonth() ).toBe( 2 );
		} );

		test( 'returns transactions before the month set in the filter', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				date: { month: '2017-12', operator: 'before' },
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( new Date( result[ 0 ].date ).getMonth() ).toBe( 10 );
			expect( new Date( result[ 1 ].date ).getMonth() ).toBe( 0 );
		} );
	} );

	describe( 'app filter', () => {
		test( 'returns the first page of all transactions when the filter is empty', () => {
			const filter = getBillingTransactionFilters( state as any, 'past' );
			const result = filterTransactions(
				state.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( result ).toEqual( state.billingTransactions.items.past.slice( 0, PAGE_SIZE ) );
		} );

		test( 'returns transactions filtered by app name', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				app: 'Store Services',
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			result.forEach( ( transaction ) => {
				expect( transaction.service ).toEqual( 'Store Services' );
			} );
		} );
	} );

	describe( 'search query', () => {
		test( 'returns all transactions when the filter is empty', () => {
			const filter = getBillingTransactionFilters( state as any, 'past' );
			const result = filterTransactions(
				state.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( result ).toEqual( state.billingTransactions.items.past.slice( 0, PAGE_SIZE ) );
		} );

		test( 'query matches a field in the root transaction object', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				query: 'mastercard',
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				state.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			result.forEach( ( transaction ) => {
				expect( transaction.cc_type ).toEqual( 'mastercard' );
			} );
		} );

		test( 'query matches date of a transaction', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				query: 'may 1',
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			result.forEach( ( transaction ) => {
				expect( transaction.date ).toBe( '2018-05-01T12:00:00' );
			} );
		} );

		test( 'query matches a field in the transaction items array', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				query: '$3.50',
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( result[ 0 ].items ).toMatchObject( [ { amount: '$3.50' } ] );
			expect( result[ 1 ].items ).toMatchObject( [ { amount: '$3.50' }, { amount: '$5.00' } ] );
			expect( result[ 2 ].items ).toMatchObject( [ { amount: '$3.50' } ] );
		} );
	} );

	describe( 'filter combinations', () => {
		test( 'date and app filters', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				date: { month: '2018-03', operator: 'equal' },
				app: 'Store Services',
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( new Date( result[ 0 ].date ).getMonth() ).toBe( 2 );
			expect( result[ 0 ].service ).toEqual( 'Store Services' );
			expect( new Date( result[ 1 ].date ).getMonth() ).toBe( 2 );
			expect( result[ 1 ].service ).toEqual( 'Store Services' );
		} );

		test( 'app and query filters', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				app: 'Store Services',
				query: '$3.50',
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( result[ 0 ].items ).toMatchObject( [ { amount: '$3.50' }, { amount: '$5.00' } ] );
			expect( result[ 0 ].service ).toEqual( 'Store Services' );
		} );

		test( 'date and query filters', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				date: { month: '2018-05', operator: 'equal' },
				query: '$3.50',
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( result[ 0 ].items ).toMatchObject( [ { amount: '$3.50' } ] );
			expect( new Date( result[ 0 ].date ).getMonth() ).toBe( 4 );
		} );

		test( 'app, date and query filters', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				date: { month: '2018-03', operator: 'equal' },
				query: 'visa',
				app: 'WordPress.com',
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( result[ 0 ].cc_type ).toEqual( 'visa' );
			expect( new Date( result[ 0 ].date ).getMonth() ).toBe( 2 );
			expect( result[ 0 ].service ).toEqual( 'WordPress.com' );
		} );
	} );

	describe( 'no results', () => {
		test( 'should return all expected meta fields including an empty transactions array', () => {
			const testState = cloneDeep( state );
			testState.billingTransactions.ui.past = {
				date: { month: '2019-01', operator: 'equal' },
			};
			const filter = getBillingTransactionFilters( testState as any, 'past' );
			const result = filterTransactions(
				testState.billingTransactions.items.past,
				filter,
				null,
				PAGE_SIZE
			);
			expect( result ).toEqual( [] );
		} );
	} );
} );
