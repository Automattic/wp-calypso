/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingBillingTransactions,
	getBillingTransactions,
	getPastBillingTransaction
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingBillingTransactions', () => {
		it( 'should return true if the billing transactions is being fetched', () => {
			const state = {
				billingTransactions: {
					requesting: true
				}
			};
			const output = isRequestingBillingTransactions( state );
			expect( output ).to.be.true;
		} );

		it( 'should return false if the billing transactions is currently not being fetched', () => {
			const state = {
				billingTransactions: {
					requesting: false
				}
			};
			const output = isRequestingBillingTransactions( state );
			expect( output ).to.be.false;
		} );

		it( 'should return false if the billing transactions has never been requested', () => {
			const output = isRequestingBillingTransactions( {} );
			expect( output ).to.be.false;
		} );
	} );

	describe( '#getBillingTransactions', () => {
		it( 'should return all billing transactions if it has been fetched', () => {
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
			const output = getBillingTransactions( state );
			expect( output ).to.eql( {
				past: [
					{
						id: '12345678',
						amount: '$1.23',
						date: new Date( '2016-12-12T11:22:33+0000' ),
					}
				],
				upcoming: [
					{
						id: '87654321',
						amount: '$4.56',
						date: new Date( '2016-13-12T11:22:33+0000' ),
					}
				]
			} );
		} );

		it( 'should return null if billing transactions has not been fetched yet', () => {
			const state = {
				billingTransactions: {
					items: null
				}
			};
			const output = getBillingTransactions( state );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getPastBillingTransaction', () => {
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
				date: new Date( '2016-12-12T11:22:33+0000' )
			} );
		} );

		it( 'should return null for an unknown billing transaction', () => {
			const output = getPastBillingTransaction( state, '87654321' );
			expect( output ).to.be.null;
		} );

		it( 'should return null if billing transactions has not been fetched yet', () => {
			const output = getPastBillingTransaction( {}, '12345678' );
			expect( output ).to.be.null;
		} );
	} );
} );
