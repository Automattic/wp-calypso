// External dependencies
import { expect } from 'chai';

// Internal dependencies
import { getPurchases, getByPurchaseId, isFetchingUserPurchases, isFetchingSitePurchases } from '../selectors';
import purchasesAssembler from 'lib/purchases/assembler';

describe( 'selectors', () => {
	describe( 'getPurchases', () => {
		it( 'should return different purchases when the purchase data changes', () => {
			const initialPurchases = Object.freeze( [
				{ ID: 1, product_name: 'domain registration', blog_id: 1337 },
				{ ID: 2, product_name: 'premium plan', blog_id: 1337 }
			] );

			const state = {
				purchases: {
					data: initialPurchases,
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true
				}
			};

			expect( getPurchases( state ) ).to.deep.equal( purchasesAssembler.createPurchasesArray( initialPurchases ) );

			const newPurchases = Object.freeze( [
				{ ID: 3, product_name: 'business plan', blog_id: 3117 }
			] );

			expect( getPurchases( Object.assign( state, {
				purchases: {
					data: newPurchases
				}
			} ) ) ).to.deep.equal( purchasesAssembler.createPurchasesArray( newPurchases ) );
		} );
	} );

	describe( 'getByPurchaseId', () => {
		it( 'should return a purchase by its ID', () => {
			const state = {
				purchases: {
					data: [
						{ ID: 1, product_name: 'domain registration', blog_id: 1337 },
						{ ID: 2, product_name: 'premium plan', blog_id: 1337 }
					],
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true
				}
			};

			expect( getByPurchaseId( state, 2 ) ).to.be.eql( {
				id: 2,
				productName: 'premium plan',
				siteId: 1337,
				active: false,
				amount: NaN,
				attachedToPurchaseId: NaN,
				canDisableAutoRenew: false,
				currencyCode: undefined,
				currencySymbol: undefined,
				domain: undefined,
				error: null,
				expiryDate: undefined,
				expiryMoment: null,
				expiryStatus: '',
				hasPrivateRegistration: false,
				includedDomain: undefined,
				isCancelable: false,
				isDomainRegistration: false,
				isRedeemable: false,
				isRefundable: false,
				isRenewable: false,
				meta: undefined,
				payment: {
					countryCode: undefined,
					countryName: undefined,
					name: undefined,
					type: undefined
				},
				priceText: 'undefinedundefined',
				productId: NaN,
				productSlug: undefined,
				refundPeriodInDays: undefined,
				refundText: 'undefinedundefined',
				renewDate: undefined,
				renewMoment: null,
				siteName: undefined,
				subscribedDate: undefined,
				subscriptionStatus: undefined,
				tagLine: undefined,
				userId: NaN
			} );
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
