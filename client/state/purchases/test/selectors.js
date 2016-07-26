// External dependencies
import { expect } from 'chai';

// Internal dependencies
import { getPurchases, getByPurchaseId, isFetchingUserPurchases, isFetchingSitePurchases, getIncludedDomainPurchase, getSitePurchases } from '../selectors';
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

	describe( 'getSitePurchases', () => {
		it( 'should return purchases of specific site', () => {
			const state = {
				purchases: {
					data: [
						{
							ID: '81414',
							blog_id: '1234'
						},
						{
							ID: '82867',
							blog_id: '1234'
						},
						{
							ID: '105103',
							blog_id: '123'
						}
					],
					error: null,
					isFetchingSitePurchases: true,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false
				}
			};

			const result = getSitePurchases( state, 1234 );

			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ].siteId ).to.equal( 1234 );
			expect( result[ 1 ].siteId ).to.equal( 1234 );
		} );
	} );

	describe( 'getIncludedDomainPurchase', () => {
		it( 'should return included domain with subscription', () => {
			const state = {
				purchases: {
					data: [
						{
							ID: '81414',
							meta: 'dev.live',
							blog_id: '123',
							is_domain_registration: 'true',
							product_slug: 'dotlive_domain'
						},
						{
							ID: '82867',
							blog_id: '123',
							product_slug: 'value_bundle',
							included_domain: 'dev.live'
						},
						{
							ID: '105103',
							blog_id: '123',
							meta: 'wordpress.com',
							product_slug: 'domain_map'
						}
					],
					error: null,
					isFetchingSitePurchases: true,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false
				}
			};

			const subscriptionPurchase = getPurchases( state ).find( purchase => purchase.productSlug === 'value_bundle' );

			expect( getIncludedDomainPurchase( state, subscriptionPurchase ).meta ).to.equal( 'dev.live' );
		} );
	} );
} );
