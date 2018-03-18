/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	getPurchases,
	getByPurchaseId,
	isFetchingUserPurchases,
	isFetchingSitePurchases,
	getIncludedDomainPurchase,
	getSitePurchases,
	isUserPaid,
} from '../selectors';
import purchasesAssembler from 'lib/purchases/assembler';

describe( 'selectors', () => {
	describe( 'getPurchases', () => {
		test( 'should return different purchases when the purchase data changes', () => {
			const initialPurchases = Object.freeze( [
				{ ID: 1, product_name: 'domain registration', blog_id: 1337 },
				{ ID: 2, product_name: 'premium plan', blog_id: 1337 },
			] );

			const state = {
				purchases: {
					data: initialPurchases,
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true,
				},
			};

			expect( getPurchases( state ) ).to.deep.equal(
				purchasesAssembler.createPurchasesArray( initialPurchases )
			);

			const newPurchases = Object.freeze( [
				{ ID: 3, product_name: 'business plan', blog_id: 3117 },
			] );

			expect(
				getPurchases(
					Object.assign( state, {
						purchases: {
							data: newPurchases,
						},
					} )
				)
			).to.deep.equal( purchasesAssembler.createPurchasesArray( newPurchases ) );
		} );
	} );

	describe( 'getByPurchaseId', () => {
		test( 'should return a purchase by its ID', () => {
			const state = {
				purchases: {
					data: [
						{ ID: 1, product_name: 'domain registration', blog_id: 1337 },
						{ ID: 2, product_name: 'premium plan', blog_id: 1337 },
					],
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true,
				},
			};

			expect( getByPurchaseId( state, 2 ) ).to.be.eql( {
				id: 2,
				productName: 'premium plan',
				siteId: 1337,
				active: false,
				amount: NaN,
				attachedToPurchaseId: NaN,
				canExplicitRenew: false,
				canDisableAutoRenew: false,
				currencyCode: undefined,
				currencySymbol: undefined,
				domain: undefined,
				error: null,
				expiryDate: undefined,
				expiryMoment: null,
				expiryStatus: '',
				hasPrivacyProtection: false,
				includedDomain: undefined,
				isCancelable: false,
				isDomainRegistration: false,
				isRefundable: false,
				isRenewable: false,
				isRenewal: false,
				meta: undefined,
				payment: {
					countryCode: undefined,
					countryName: undefined,
					name: undefined,
					type: undefined,
				},
				priceText: 'undefinedundefined',
				productId: NaN,
				productSlug: undefined,
				pendingTransfer: false,
				refundPeriodInDays: undefined,
				refundAmount: NaN,
				refundText: 'undefinedundefined',
				renewDate: undefined,
				renewMoment: null,
				siteName: undefined,
				subscribedDate: undefined,
				subscriptionStatus: undefined,
				tagLine: undefined,
				userId: NaN,
			} );
		} );
	} );

	describe( 'isFetchingUserPurchases', () => {
		test( 'should return the current state of the user purchases request', () => {
			const state = {
				purchases: {
					data: [],
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: true,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false,
				},
			};

			expect( isFetchingUserPurchases( state ) ).to.be.true;
		} );
	} );

	describe( 'isFetchingSitePurchases', () => {
		test( 'should return the current state of the site purchases request', () => {
			const state = {
				purchases: {
					data: [],
					error: null,
					isFetchingSitePurchases: true,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false,
				},
			};

			expect( isFetchingSitePurchases( state ) ).to.be.true;
		} );
	} );

	describe( 'getSitePurchases', () => {
		test( 'should return purchases of specific site', () => {
			const state = {
				purchases: {
					data: [
						{
							ID: '81414',
							blog_id: '1234',
						},
						{
							ID: '82867',
							blog_id: '1234',
						},
						{
							ID: '105103',
							blog_id: '123',
						},
					],
					error: null,
					isFetchingSitePurchases: true,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false,
				},
			};

			const result = getSitePurchases( state, 1234 );

			expect( result.length ).to.equal( 2 );
			expect( result[ 0 ].siteId ).to.equal( 1234 );
			expect( result[ 1 ].siteId ).to.equal( 1234 );
		} );
	} );

	describe( 'getIncludedDomainPurchase', () => {
		test( 'should return included domain with subscription', () => {
			const state = {
				purchases: {
					data: [
						{
							ID: '81414',
							meta: 'dev.live',
							blog_id: '123',
							is_domain_registration: 'true',
							product_slug: 'dotlive_domain',
						},
						{
							ID: '82867',
							blog_id: '123',
							product_slug: 'value_bundle',
							included_domain: 'dev.live',
						},
						{
							ID: '105103',
							blog_id: '123',
							meta: 'wordpress.com',
							product_slug: 'domain_map',
						},
					],
					error: null,
					isFetchingSitePurchases: true,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false,
				},
			};

			const subscriptionPurchase = getPurchases( state ).find(
				purchase => purchase.productSlug === 'value_bundle'
			);

			expect( getIncludedDomainPurchase( state, subscriptionPurchase ).meta ).to.equal(
				'dev.live'
			);
		} );
	} );

	describe( 'isUserPaid', () => {
		const targetUserId = 123;
		const examplePurchases = Object.freeze( [
			{ ID: 1, product_name: 'domain registration', blog_id: 1337, user_id: targetUserId },
			{ ID: 2, product_name: 'premium plan', blog_id: 1337, user_id: targetUserId },
		] );

		test( 'should return false because there is no purchases', () => {
			const state = {
				purchases: {
					data: [],
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true,
				},
			};

			expect( isUserPaid( state, targetUserId ) ).to.be.false;
		} );

		test( 'should return true because there are purchases from the target user', () => {
			const state = {
				purchases: {
					data: examplePurchases,
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true,
				},
			};

			expect( isUserPaid( state, targetUserId ) ).to.be.true;
		} );

		test( 'should return false because there are no purchases from this user', () => {
			const state = {
				purchases: {
					data: examplePurchases,
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true,
				},
			};

			expect( isUserPaid( state, 65535 ) ).to.be.false;
		} );

		test( 'should return false because the data is not ready.', () => {
			const state = {
				purchases: {
					data: examplePurchases,
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false,
				},
			};

			expect( isUserPaid( state, targetUserId ) ).to.be.false;
		} );
	} );
} );
