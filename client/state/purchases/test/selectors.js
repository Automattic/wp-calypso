import { createPurchasesArray } from 'calypso/lib/purchases/assembler';
import {
	getByPurchaseId,
	getIncludedDomainPurchase,
	getPurchases,
	getSitePurchases,
	isFetchingSitePurchases,
	isFetchingUserPurchases,
	isUserPaid,
} from '../selectors';

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

			expect( getPurchases( state ) ).toEqual( createPurchasesArray( initialPurchases ) );

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
			).toEqual( createPurchasesArray( newPurchases ) );
		} );
	} );

	describe( 'getByPurchaseId', () => {
		test( 'should return a purchase by its ID', () => {
			const state = {
				purchases: {
					data: [
						{ ID: 1, product_name: 'domain registration', blog_id: 1337 },
						{
							ID: 2,
							product_name: 'premium plan',
							blog_id: 1337,
							is_rechargable: true,
							auto_renew: '1',
							refund_integer: 9600,
							total_refund_integer: 9600,
							total_refund_currency: 'USD',
						},
					],
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true,
				},
			};

			expect( getByPurchaseId( state, 2 ) ).toEqual( {
				id: 2,
				productName: 'premium plan',
				siteId: 1337,
				active: false,
				amount: NaN,
				attachedToPurchaseId: NaN,
				autoRenewCouponCode: undefined,
				autoRenewCouponDiscountPercentage: NaN,
				billPeriodDays: NaN,
				billPeriodLabel: undefined,
				blogCreatedDate: undefined,
				canExplicitRenew: false,
				canDisableAutoRenew: false,
				canReenableAutoRenewal: false,
				costToUnbundle: NaN,
				costToUnbundleText: undefined,
				currencyCode: undefined,
				currencySymbol: undefined,
				description: undefined,
				domain: undefined,
				domainRegistrationAgreementUrl: null,
				error: null,
				expiryDate: undefined,
				expiryStatus: '',
				iapPurchaseManagementLink: undefined,
				includedDomain: undefined,
				includedDomainPurchaseAmount: undefined,
				introductoryOffer: null,
				isAutoRenewEnabled: true,
				isCancelable: false,
				isDomain: false,
				isDomainRegistration: false,
				isLocked: false,
				isHundredYearDomain: false,
				isInAppPurchase: false,
				isRechargeable: true,
				isRefundable: false,
				isRenewable: false,
				isRenewal: false,
				isWooExpressTrial: false,
				meta: undefined,
				mostRecentRenewDate: undefined,
				ownershipId: NaN,
				partnerKeyId: undefined,
				partnerName: undefined,
				partnerSlug: undefined,
				payment: {
					countryCode: undefined,
					countryName: undefined,
					name: undefined,
					type: undefined,
					storedDetailsId: undefined,
				},
				priceText: undefined,
				productDisplayPrice: undefined,
				productId: NaN,
				productSlug: undefined,
				pendingTransfer: false,
				refundPeriodInDays: undefined,
				totalRefundAmount: NaN,
				totalRefundInteger: 9600,
				totalRefundText: undefined,
				totalRefundCurrency: 'USD',
				refundAmount: NaN,
				refundInteger: 9600,
				refundOptions: undefined,
				refundText: undefined,
				regularPriceText: undefined,
				renewDate: undefined,
				saleAmount: undefined,
				siteName: undefined,
				subscribedDate: undefined,
				subscriptionStatus: undefined,
				tagLine: undefined,
				taxAmount: undefined,
				taxText: undefined,
				purchaseRenewalQuantity: null,
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

			expect( isFetchingUserPurchases( state ) ).toBe( true );
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

			expect( isFetchingSitePurchases( state ) ).toBe( true );
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

			expect( result ).toHaveLength( 2 );
			expect( result[ 0 ].siteId ).toBe( 1234 );
			expect( result[ 1 ].siteId ).toBe( 1234 );
		} );
	} );

	describe( 'getIncludedDomainPurchase', () => {
		test( 'should return included domain registration with subscription', () => {
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
				( purchase ) => purchase.productSlug === 'value_bundle'
			);

			expect( getIncludedDomainPurchase( state, subscriptionPurchase ).meta ).toBe( 'dev.live' );
		} );

		test( 'should not return included domain registration with subscription if the domain registration has a non-zero amount', () => {
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
							included_domain_purchase_amount: 25,
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
				( purchase ) => purchase.productSlug === 'value_bundle'
			);

			expect( getIncludedDomainPurchase( state, subscriptionPurchase ) ).toBeFalsy();
		} );

		test( 'should return included domain transfer with subscription', () => {
			const state = {
				purchases: {
					data: [
						{
							ID: '81414',
							meta: 'dev.live',
							blog_id: '123',
							product_slug: 'domain_transfer',
						},
						{
							ID: '82867',
							blog_id: '123',
							product_slug: 'value_bundle',
							included_domain: 'dev.live',
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
				( purchase ) => purchase.productSlug === 'value_bundle'
			);

			expect( getIncludedDomainPurchase( state, subscriptionPurchase ).meta ).toBe( 'dev.live' );
		} );

		test( 'should not return included domain transfer with subscription if the domain transfer has a non-zero amount', () => {
			const state = {
				purchases: {
					data: [
						{
							ID: '81414',
							meta: 'dev.live',
							blog_id: '123',
							product_slug: 'domain_transfer',
						},
						{
							ID: '82867',
							blog_id: '123',
							product_slug: 'value_bundle',
							included_domain: 'dev.live',
							included_domain_purchase_amount: 25,
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
				( purchase ) => purchase.productSlug === 'value_bundle'
			);

			expect( getIncludedDomainPurchase( state, subscriptionPurchase ) ).toBeFalsy();
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
				currentUser: {
					id: targetUserId,
				},
				purchases: {
					data: [],
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true,
				},
			};

			expect( isUserPaid( state ) ).toBe( false );
		} );

		test( 'should return true because there are purchases from the target user', () => {
			const state = {
				currentUser: {
					id: targetUserId,
				},
				purchases: {
					data: examplePurchases,
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true,
				},
			};

			expect( isUserPaid( state ) ).toBe( true );
		} );

		test( 'should return false because there are no purchases from this user', () => {
			const state = {
				currentUser: {
					id: 65535,
				},
				purchases: {
					data: examplePurchases,
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: true,
				},
			};

			expect( isUserPaid( state ) ).toBe( false );
		} );

		test( 'should return null because the data is not ready.', () => {
			const state = {
				currentUser: {
					id: targetUserId,
				},
				purchases: {
					data: examplePurchases,
					error: null,
					isFetchingSitePurchases: false,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false,
				},
			};

			expect( isUserPaid( state ) ).toBeNull();
		} );
	} );
} );
