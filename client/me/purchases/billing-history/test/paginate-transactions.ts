import { cloneDeep } from 'lodash';
import {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';
import { paginateTransactions } from '../filter-transactions';

const mockTransaction: BillingTransaction = {
	currency: 'USD',
	address: '',
	amount: '',
	amount_integer: 0,
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
	subtotal_integer: 0,
	support: '',
	tax: '',
	tax_integer: 0,
	url: '',
};

const mockItem: BillingTransactionItem = {
	id: '',
	type: '',
	type_localized: '',
	domain: '',
	site_id: '',
	subtotal: '',
	subtotal_integer: 0,
	tax_integer: 0,
	amount_integer: 0,
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
	},
};

describe( 'paginateTransactions()', () => {
	test( 'returns all transactions when there are fewer than the page limit', () => {
		const testState = cloneDeep( state );
		const pageSize = testState.billingTransactions.items.past.length + 1;
		const result = paginateTransactions( testState.billingTransactions.items.past, 1, pageSize );
		expect( result ).toEqual( state.billingTransactions.items.past );
	} );

	test( 'returns all transactions when there are the same number as the page limit', () => {
		const testState = cloneDeep( state );
		const pageSize = testState.billingTransactions.items.past.length;
		const result = paginateTransactions( testState.billingTransactions.items.past, 1, pageSize );
		expect( result ).toEqual( state.billingTransactions.items.past );
	} );

	test( 'returns a page from all transactions when there are more than the page limit', () => {
		const testState = cloneDeep( state );
		const pageSize = testState.billingTransactions.items.past.length - 1;
		const result = paginateTransactions( testState.billingTransactions.items.past, 1, pageSize );
		expect( result ).toEqual( state.billingTransactions.items.past.slice( 0, pageSize ) );
	} );

	test( 'returns the first page of transactions when no page is specified', () => {
		const testState = cloneDeep( state );
		const pageSize = testState.billingTransactions.items.past.length - 1;
		const result = paginateTransactions( testState.billingTransactions.items.past, null, pageSize );
		expect( result ).toEqual( state.billingTransactions.items.past.slice( 0, pageSize ) );
	} );

	test( 'returns the second page of transactions when the second page is specified', () => {
		const testState = cloneDeep( state );
		const result = paginateTransactions( testState.billingTransactions.items.past, 2, 3 );
		expect( result.length ).toEqual( 3 );
		expect( result ).toEqual( state.billingTransactions.items.past.slice( 3, 6 ) );
		expect( result[ 0 ].items ).toMatchObject( [ { date: '2018-03-15T10:39:27' } ] );
		expect( result[ 1 ].items ).toMatchObject( [ { date: '2018-03-13T16:10:45' } ] );
		expect( result[ 2 ].items ).toMatchObject( [ { date: '2018-01-10T14:24:38' } ] );
	} );

	test( 'returns an abbreviated last page of transactions when the last page is specified', () => {
		const testState = cloneDeep( state );
		const result = paginateTransactions( testState.billingTransactions.items.past, 4, 3 );
		expect( result.length ).toEqual( 1 );
		expect( result ).toEqual( state.billingTransactions.items.past.slice( 9, 10 ) );
		expect( result[ 0 ].items ).toMatchObject( [ { date: '2017-01-01T00:00:00' } ] );
	} );
} );
