/**
 * External dependencies
 */
import { expect } from 'chai';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getPastBillingTransaction } from '../';

describe( 'getPastBillingTransaction()', () => {
	const state = {
		billingTransactions: {
			items: {
				past: [
					{
						id: '12345678',
						amount: '$1.23',
						date: '2016-12-12T11:22:33+0000',
					}
				],
				upcoming: [
					{
						id: '87654321',
						amount: '$4.56',
						date: '2016-13-12T11:22:33+0000',
					}
				]
			}
		}
	};

	it( 'should return the billing transaction data for a known transaction', () => {
		const output = getPastBillingTransaction( state, '12345678' );
		expect( output ).to.eql( {
			...state.billingTransactions.items.past[ 0 ],
			date: moment( '2016-12-12T11:22:33+0000' ).toDate()
		} );
	} );

	it( 'should return null for an unknown billing transaction', () => {
		const output = getPastBillingTransaction( state, '87654321' );
		expect( output ).to.be.null;
	} );

	it( 'should return null if billing transactions have not been fetched yet', () => {
		const output = getPastBillingTransaction( {
			billingTransactions: {
				items: {}
			}
		}, '12345678' );
		expect( output ).to.be.null;
	} );
} );
