// External dependencies
import { expect } from 'chai';

// Internal dependencies
import { getByPurchaseId } from '../selectors';

describe( 'selectors', () => {
	describe( 'getByPurchaseId', () => {
		it( 'should return a purchase by its ID, preserving the top-level flags', () => {
			const state = {
				data: [
					{ id: 1, name: 'domain registration' },
					{ id: 2, name: 'premium plan' }
				],
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: false,
				hasLoadedUserPurchasesFromServer: true
			};

			expect( getByPurchaseId( state, 2 ) ).to.be.eql( {
				data: { id: 2, name: 'premium plan' },
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: false,
				hasLoadedUserPurchasesFromServer: true
			} );
		} );
	} );
} );
