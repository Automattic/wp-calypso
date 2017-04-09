/**
 * External dependencies
 */
import { expect } from 'chai';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getBillingTransactions } from '../';

describe( 'getBillingTransactions()', () => {
	it( 'should return all billing transactions if they have been fetched', () => {
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
					date: moment( '2016-12-12T11:22:33+0000' ).toDate(),
				}
			],
			upcoming: [
				{
					id: '87654321',
					amount: '$4.56',
					date: moment( '2016-13-12T11:22:33+0000' ).toDate(),
				}
			]
		} );
	} );

	it( 'should return null if billing transactions have not been fetched yet', () => {
		const state = {
			billingTransactions: {
				items: null
			}
		};
		const output = getBillingTransactions( state );
		expect( output ).to.be.null;
	} );
} );
