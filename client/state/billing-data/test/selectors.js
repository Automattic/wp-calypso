/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	isRequestingBillingData,
	getBillingData,
	getPastBillingTransaction
} from '../selectors';

describe( 'selectors', () => {
	describe( '#isRequestingBillingData', () => {
		it( 'should return true if the billing data is being fetched', () => {
			const state = {
				billingData: {
					requesting: true
				}
			};
			const output = isRequestingBillingData( state );
			expect( output ).to.be.true;
		} );

		it( 'should return false if the billing data is currently not being fetched', () => {
			const state = {
				billingData: {
					requesting: false
				}
			};
			const output = isRequestingBillingData( state );
			expect( output ).to.be.false;
		} );

		it( 'should return false if the billing data has never been requested', () => {
			const output = isRequestingBillingData( {} );
			expect( output ).to.be.false;
		} );
	} );

	describe( '#getBillingData', () => {
		it( 'should return all billing data if it has been fetched', () => {
			const state = {
				billingData: {
					items: {
						past: [
							{
								id: '12345678',
								amount: '$1.23',
							}
						],
						upcoming: [
							{
								id: '87654321',
								amount: '$4.56',
							}
						]
					}
				}
			};
			const output = getBillingData( state );
			expect( output ).to.eql( state.billingData.items );
		} );

		it( 'should return null if billing data has not been fetched yet', () => {
			const state = {
				billingData: {
					items: null
				}
			};
			const output = getBillingData( state );
			expect( output ).to.be.null;
		} );
	} );

	describe( '#getPastBillingTransaction', () => {
		const state = {
			billingData: {
				items: {
					past: [
						{
							id: '12345678',
							amount: '$1.23',
						}
					],
					upcoming: [
						{
							id: '87654321',
							amount: '$4.56',
						}
					]
				}
			}
		};

		it( 'should return the billing transaction data for a known transaction', () => {
			const output = getPastBillingTransaction( state, '12345678' );
			expect( output ).to.eql( state.billingData.items.past[ 0 ] );
		} );

		it( 'should return null for an unknown billing transaction', () => {
			const output = getPastBillingTransaction( state, '87654321' );
			expect( output ).to.be.null;
		} );

		it( 'should return null if billing data has not been fetched yet', () => {
			const output = getPastBillingTransaction( {}, '12345678' );
			expect( output ).to.be.null;
		} );
	} );
} );
