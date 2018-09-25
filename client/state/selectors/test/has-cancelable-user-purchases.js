/** @format */

/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import hasCancelableUserPurchases from 'state/selectors/has-cancelable-user-purchases';

describe( 'hasCancelableUserPurchases', () => {
	const targetUserId = 123;
	const examplePurchases = deepFreeze( [
		{ ID: 1, product_name: 'domain registration', blog_id: 1337, user_id: targetUserId },
		{ ID: 2, product_name: 'premium plan', blog_id: 1337, user_id: targetUserId },
		{
			ID: 3,
			product_name: 'premium theme',
			product_slug: 'premium_theme',
			blog_id: 1337,
			user_id: targetUserId,
		},
	] );

	test( 'should return false because there are no purchases', () => {
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

		expect( hasCancelableUserPurchases( state, targetUserId ) ).toBe( false );
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

		expect( hasCancelableUserPurchases( state, targetUserId ) ).toBe( true );
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

		expect( hasCancelableUserPurchases( state, 65535 ) ).toBe( false );
	} );

	test( 'should return false because the data is not ready', () => {
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

		expect( hasCancelableUserPurchases( state, targetUserId ) ).toBe( false );
	} );

	test( 'should return false because all of the purchases are themes', () => {
		const state = {
			purchases: {
				data: deepFreeze( [
					{
						ID: 3,
						product_name: 'premium theme',
						product_slug: 'premium_theme',
						blog_id: 1337,
						user_id: targetUserId,
					},
				] ),
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: false,
				hasLoadedUserPurchasesFromServer: false,
			},
		};

		expect( hasCancelableUserPurchases( state, targetUserId ) ).toBe( false );
	} );
} );
