/** @format */

/**
 * External dependencies
 */
import { clone } from 'lodash';
import { expect } from 'chai';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPastBillingTransaction } from 'state/selectors';

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
		expect( output ).to.eql( {
			...state.billingTransactions.items.past[ 0 ],
			date: moment( '2016-12-12T11:22:33+0000' ).toDate(),
		} );
	} );

	test( 'should return null for an unknown billing transaction', () => {
		const output = getPastBillingTransaction( state, '87654321' );
		expect( output ).to.be.null;
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
		expect( output ).to.be.null;
	} );

	test( 'should return a billing transaction that has been fetched individually', () => {
		const individualTransaction = {
			id: '999999',
			amount: '$1.23',
			date: '2017-01-01T11:22:33+0000',
		};

		const testState = clone( state );
		testState.billingTransactions.individualTransactions = {
			receipts: {
				999999: individualTransaction,
			},
		};

		const output = getPastBillingTransaction( testState, '999999' );
		expect( output ).to.eql( individualTransaction );
	} );
} );
