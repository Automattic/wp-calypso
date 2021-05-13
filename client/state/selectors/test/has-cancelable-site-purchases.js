/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import hasCancelableSitePurchases from 'calypso/state/selectors/has-cancelable-site-purchases';

describe( 'hasCancelableSitePurchases', () => {
	const targetUserId = 123;
	const targetSiteId = 1337;
	const examplePurchases = [
		{
			ID: 1,
			product_name: 'domain registration',
			product_slug: 'domain_registration',
			blog_id: targetSiteId,
			user_id: targetUserId,
			active: true,
		},
		{
			ID: 2,
			product_name: 'premium plan',
			blog_id: targetSiteId,
			user_id: targetUserId,
			product_slug: 'premium_plan',
			active: true,
		},
		{
			ID: 3,
			product_name: 'premium theme',
			product_slug: 'premium_theme',
			blog_id: targetSiteId,
			user_id: targetUserId,
			active: true,
		},
	];

	test( 'should return false because there are no purchases', () => {
		const state = deepFreeze( {
			purchases: {
				data: [],
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: false,
			},
		} );

		expect( hasCancelableSitePurchases( state, targetSiteId ) ).toBe( false );
	} );

	test( 'should return true because there are purchases from the target site', () => {
		const state = deepFreeze( {
			purchases: {
				data: examplePurchases,
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: false,
			},
		} );

		expect( hasCancelableSitePurchases( state, targetSiteId ) ).toBe( true );
	} );

	test( 'should return false because there are no purchases for this site', () => {
		const state = deepFreeze( {
			purchases: {
				data: examplePurchases,
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: false,
			},
		} );

		expect( hasCancelableSitePurchases( state, 65535 ) ).toBe( false );
	} );

	test( 'should return false because the data is not ready', () => {
		const state = deepFreeze( {
			purchases: {
				data: examplePurchases,
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: false,
				hasLoadedUserPurchasesFromServer: false,
			},
		} );

		expect( hasCancelableSitePurchases( state, targetSiteId ) ).toBe( false );
	} );

	test( 'should return false because the only purchase is a non-refundable theme', () => {
		const state = deepFreeze( {
			purchases: {
				data: [
					{
						ID: 3,
						product_name: 'premium theme',
						product_slug: 'premium_theme',
						blog_id: targetSiteId,
						user_id: targetUserId,
						is_refundable: false,
						active: true,
					},
				],
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true,
			},
		} );

		expect( hasCancelableSitePurchases( state, targetSiteId ) ).toBe( false );
	} );

	test( 'should return true because one of the purchases is a refundable theme', () => {
		const state = deepFreeze( {
			purchases: {
				data: [
					{
						ID: 3,
						product_name: 'premium theme',
						product_slug: 'premium_theme',
						blog_id: targetSiteId,
						user_id: targetUserId,
						is_refundable: true,
						active: true,
					},
				],
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true,
			},
		} );

		expect( hasCancelableSitePurchases( state, targetSiteId ) ).toBe( true );
	} );

	test( 'should return false if the only purchase is inactive', () => {
		const state = deepFreeze( {
			purchases: {
				data: [
					{
						ID: 3,
						product_name: 'premium_plan',
						product_slug: 'premium_plan',
						blog_id: targetSiteId,
						user_id: targetUserId,
						is_refundable: true,
						active: false,
					},
				],
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true,
			},
		} );

		expect( hasCancelableSitePurchases( state, targetSiteId ) ).toBe( false );
	} );
} );
