// External dependencies
import { expect } from 'chai';

// Internal dependencies
import { getByPurchaseId, isFetchingUserPurchases, isFetchingSitePurchases } from '../selectors';

describe( 'selectors', () => {
	describe( 'getByPurchaseId', () => {
		it( 'should return a purchase by its ID', () => {
			const state = {
				purchases: {
					data: [
						{ id: 1, name: 'domain registration' },
						{ id: 2, name: 'premium plan' }
					],
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true
				}
			};

			expect( getByPurchaseId( state, 2 ) ).to.be.eql( { id: 2, name: 'premium plan' } );
		} );
	} );

	describe( 'isFetchingUserPurchases', () => {
		it( 'should return the current state of the user purchases request', () => {
			const state = {
				purchases: {
					data: [],
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: true,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false
				}
			};

			expect( isFetchingUserPurchases( state ) ).to.be.true;
		} );
	} );

	describe( 'isFetchingSitePurchases', () => {
		it( 'should return the current state of the site purchases request', () => {
			const state = {
				purchases: {
					data: [],
					error: null,
					isFetchingSitePurchases: true,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false
				}
			};

			expect( isFetchingSitePurchases( state ) ).to.be.true;
		} );
	} );
} );
