/**
 * External dependencies
 */
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import getUserPurchasedPremiumThemes from 'calypso/state/selectors/get-user-purchased-premium-themes';

describe( 'getUserPurchasedPremiumThemes', () => {
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

	test( 'should return an empty array because there are no purchases', () => {
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

		expect( getUserPurchasedPremiumThemes( state, targetUserId ) ).toEqual( [] );
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

		expect( getUserPurchasedPremiumThemes( state, targetUserId ) ).toBe( false );
	} );

	test( 'should return an array of themes because there is a theme purchase for the specified user', () => {
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

		const purchasedPremiumThemes = getUserPurchasedPremiumThemes( state, targetUserId );
		expect( purchasedPremiumThemes.length ).toBe( 1 );
		expect( purchasedPremiumThemes[ 0 ] ).toMatchObject( {
			id: 3,
			productName: 'premium theme',
			productSlug: 'premium_theme',
			userId: targetUserId,
		} );
	} );
} );
