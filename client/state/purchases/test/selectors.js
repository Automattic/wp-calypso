/**
 * Internal dependencies
 */
import { createPurchasesArray } from 'lib/purchases/assembler';
import {
	getByPurchaseId,
	getIncludedDomainPurchase,
	getPurchases,
	getSitePurchases,
	isFetchingSitePurchases,
	isFetchingUserPurchases,
	isUserPaid,
	siteHasBackupProductPurchase,
} from '../selectors';

// Gets rid of warnings such as 'UnhandledPromiseRejectionWarning: Error: No available storage method found.'
jest.mock( 'lib/user', () => () => {} );

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
						{ ID: 2, product_name: 'premium plan', blog_id: 1337, is_rechargable: true },
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
				canExplicitRenew: false,
				canDisableAutoRenew: false,
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
				includedDomain: undefined,
				includedDomainPurchaseAmount: undefined,
				isCancelable: false,
				isDomainRegistration: false,
				isRechargeable: true,
				isRefundable: false,
				isRenewable: false,
				isRenewal: false,
				meta: undefined,
				mostRecentRenewDate: undefined,
				payment: {
					countryCode: undefined,
					countryName: undefined,
					name: undefined,
					type: undefined,
				},
				priceText: undefined,
				productId: NaN,
				productSlug: undefined,
				pendingTransfer: false,
				refundPeriodInDays: undefined,
				refundAmount: NaN,
				refundText: undefined,
				renewDate: undefined,
				siteName: undefined,
				subscribedDate: undefined,
				subscriptionStatus: undefined,
				tagLine: undefined,
				taxAmount: undefined,
				taxText: undefined,
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

	describe( 'siteHasBackupProductPurchase', () => {
		test( 'should return true if a site has a Jetpack Backup purchase, false otherwise', () => {
			const state = {
				purchases: {
					data: [
						{
							ID: '81414',
							blog_id: '1234',
							active: true,
							product_slug: 'jetpack_personal',
						},
						{
							ID: '82867',
							blog_id: '1234',
							active: true,
							product_slug: 'something',
						},
						{
							ID: '105103',
							blog_id: '123',
							active: true,
							product_slug: 'jetpack_backup_daily',
						},
					],
					error: null,
					isFetchingSitePurchases: true,
					isFetchingUserPurchases: false,
					hasLoadedSitePurchasesFromServer: false,
					hasLoadedUserPurchasesFromServer: false,
				},
			};

			expect( siteHasBackupProductPurchase( state, 1234 ) ).toBe( false );
			expect( siteHasBackupProductPurchase( state, 123 ) ).toBe( true );
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
				( purchase ) => purchase.productSlug === 'value_bundle'
			);

			expect( getIncludedDomainPurchase( state, subscriptionPurchase ).meta ).toBe( 'dev.live' );
		} );

		test( 'should not return included domain with subscription if the domain has a non-zero amount', () => {
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

			expect( isUserPaid( state, targetUserId ) ).toBe( false );
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

			expect( isUserPaid( state, targetUserId ) ).toBe( true );
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

			expect( isUserPaid( state, 65535 ) ).toBe( false );
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

			expect( isUserPaid( state, targetUserId ) ).toBe( false );
		} );
	} );
} );
