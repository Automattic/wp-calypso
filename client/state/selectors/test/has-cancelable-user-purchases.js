import deepFreeze from 'deep-freeze';
import hasCancelableUserPurchases from 'calypso/state/selectors/has-cancelable-user-purchases';

describe( 'hasCancelableUserPurchases', () => {
	const targetUserId = 123;
	const examplePurchases = [
		{ ID: 1, product_name: 'domain registration', blog_id: 1337, user_id: targetUserId },
		{ ID: 2, product_name: 'premium plan', blog_id: 1337, user_id: targetUserId },
		{
			ID: 3,
			product_name: 'premium theme',
			product_slug: 'premium_theme',
			blog_id: 1337,
			user_id: targetUserId,
		},
	];

	test( 'should return false because there are no purchases', () => {
		const state = deepFreeze( {
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
		} );

		expect( hasCancelableUserPurchases( state ) ).toBe( false );
	} );

	test( 'should return true because there are purchases from the target user', () => {
		const state = deepFreeze( {
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
		} );

		expect( hasCancelableUserPurchases( state ) ).toBe( true );
	} );

	test( 'should return false because there are no purchases from this user', () => {
		const state = deepFreeze( {
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
		} );

		expect( hasCancelableUserPurchases( state ) ).toBe( false );
	} );

	test( 'should return null because the data is not ready', () => {
		const state = deepFreeze( {
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
		} );

		expect( hasCancelableUserPurchases( state ) ).toBeNull();
	} );

	test( 'should return false because the only purchase is a non-refundable theme', () => {
		const state = deepFreeze( {
			currentUser: {
				id: targetUserId,
			},
			purchases: {
				data: [
					{
						ID: 3,
						product_name: 'premium theme',
						product_slug: 'premium_theme',
						blog_id: 1337,
						user_id: targetUserId,
						is_refundable: false,
					},
				],
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: false,
				hasLoadedUserPurchasesFromServer: true,
			},
		} );

		expect( hasCancelableUserPurchases( state ) ).toBe( false );
	} );

	test( 'should return true because one of the purchases is a refundable theme', () => {
		const state = deepFreeze( {
			currentUser: {
				id: targetUserId,
			},
			purchases: {
				data: [
					{
						ID: 3,
						product_name: 'premium theme',
						product_slug: 'premium_theme',
						blog_id: 1337,
						user_id: targetUserId,
						is_refundable: true,
					},
				],
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: false,
				hasLoadedUserPurchasesFromServer: true,
			},
		} );

		expect( hasCancelableUserPurchases( state ) ).toBe( true );
	} );
} );
