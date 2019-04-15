/**
 * @format
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import React from 'react';
import { mount } from 'enzyme';
import { translate, moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { TransactionsTable } from '../transactions-table';
import { createReduxStore } from 'state';
// import TransactionAmount from '../transaction-amount';

describe( 'TransactionTable', () => {
	const transactions = [
		{
			subtotal: '$36.00',
			tax: '$2.48',
			amount: '$38.48',
			items: [
				{
					raw_tax: 2.48,
				},
			],
			date: '2018-01-11',
		},
		{
			subtotal: '$96.00',
			tax: '$2.48',
			amount: '$38.48',
			items: [
				{
					raw_tax: 2.48,
				},
			],
			date: '2018-01-11',
		},
	];

	const upcoming = [ { amount: '€38.48' }, { amount: '€96.48' } ];

	const store = createReduxStore();

	const renderer = jest.fn();

	const defaultProps = {
		translate: translate,
		moment: moment,
		date: moment( '2018-01-11' ),
		store: store,
		transactionRenderer: renderer,
		emptyTableText: '',
		noFilterResultsText: '',
		pageSize: 10,
		page: 1, // not required, but is via dep
		query: '',
		total: 1,
		transactionType: 'past',
	};

	test( 'placeholder', () => {
		const wrapper = mount( <TransactionsTable { ...defaultProps } /> );
		expect( wrapper.find( '.billing-history__transactions .is-placeholder' ) ).toHaveLength( 1 );
	} );

	test( 'no results', () => {
		const wrapper = mount( <TransactionsTable { ...defaultProps } transactions={ [] } /> );
		expect( wrapper.find( '.billing-history__no-results' ) ).toHaveLength( 1 );
	} );

	test( 'past', () => {
		const wrapper = mount(
			<TransactionsTable { ...defaultProps } transactionType="past" transactions={ transactions } />
		);
		expect( wrapper.find( '.billing-history__amount' ) ).toHaveLength( transactions.length );
		expect(
			wrapper
				.find( '.billing-history__transaction-tax-amount' )
				.first()
				.text()
		).toEqual( '(includes ' + transactions[ 0 ].tax + ' tax)' );
	} );

	test( 'upcoming', () => {
		const wrapper = mount(
			<TransactionsTable { ...defaultProps } transactionType="upcoming" transactions={ upcoming } />
		);
		expect(
			wrapper
				.find( '.billing-history__transaction-tax-amount' )
				.first()
				.text()
		).toEqual( '(+ applicable tax)' );
	} );
} );
