/**
 * Internal dependencies
 */
import getBillingTransactionDateFilterValues from 'state/selectors/get-billing-transaction-date-filter-values';

jest.mock( 'i18n-calypso', () => {
	return {
		translate: ( str ) => str,
	};
} );

const moment = require( 'moment' );
moment.now = () => new Date( 2018, 4, 24 ); // May 24, 2018

describe( 'getBillingTransactionDateFilterValues()', () => {
	const state = {
		billingTransactions: {
			items: {
				past: [
					{
						date: '2018-05-01T12:00:00+0000',
					},
					{
						date: '2018-04-11T13:11:27+0000',
					},
					{
						date: '2018-03-11T21:00:00+0000',
					},
					{
						date: '2018-03-15T10:39:27+0000',
					},
					{
						date: '2018-03-13T16:10:45+0000',
					},
					{
						date: '2018-01-10T14:24:38+0000',
					},
					{
						date: '2017-12-10T10:30:38+0000',
					},
					{
						date: '2017-12-01T07:20:00+0000',
					},
					{
						date: '2017-11-24T05:13:00+0000',
					},
					{
						date: '2017-01-01T00:00:00+0000',
					},
				],
			},
		},
	};

	test( 'returns transaction app filter values with counts', () => {
		const result = getBillingTransactionDateFilterValues( state, 'past' );
		expect( result ).toEqual( [
			{
				count: 1,
				dateString: '2018-05-01',
				value: {
					month: '2018-05',
					operator: 'equal',
				},
			},
			{
				count: 1,
				dateString: '2018-04-01',
				value: {
					month: '2018-04',
					operator: 'equal',
				},
			},
			{
				count: 3,
				dateString: '2018-03-01',
				value: {
					month: '2018-03',
					operator: 'equal',
				},
			},
			{
				count: 0,
				dateString: '2018-02-01',
				value: {
					month: '2018-02',
					operator: 'equal',
				},
			},
			{
				count: 1,
				dateString: '2018-01-01',
				value: {
					month: '2018-01',
					operator: 'equal',
				},
			},
			{
				count: 2,
				dateString: '2017-12-01',
				value: {
					month: '2017-12',
					operator: 'equal',
				},
			},
			{
				count: 2,
				older: true,
				value: {
					month: '2017-12',
					operator: 'before',
				},
			},
		] );
	} );

	test( 'returns an empty array when there are no transactions', () => {
		const result = getBillingTransactionDateFilterValues(
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
