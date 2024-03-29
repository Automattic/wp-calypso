import {
	PURCHASE_REMOVE_COMPLETED,
	PURCHASES_USER_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_USER_FETCH_COMPLETED,
} from 'calypso/state/action-types';
import reducer from '../reducer';

describe( 'reducer', () => {
	const userId = '1337';
	const siteId = '2701';

	test( 'should return an object with the initial state', () => {
		expect( reducer( undefined, { type: 'UNRELATED' } ) ).toEqual( {
			data: [],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: false,
			hasLoadedUserPurchasesFromServer: false,
		} );
	} );

	test( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		expect( reducer( undefined, { type: PURCHASES_USER_FETCH } ) ).toEqual( {
			data: [],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: true,
			hasLoadedSitePurchasesFromServer: false,
			hasLoadedUserPurchasesFromServer: false,
		} );
	} );

	test( 'should return an object with the list of purchases when fetching completed', () => {
		const siteId2 = '2828828282';
		let state = reducer( undefined, {
			type: PURCHASES_USER_FETCH_COMPLETED,
			purchases: [
				{ ID: '1', blog_id: siteId2, user_id: userId },
				{ ID: '2', blog_id: siteId, user_id: userId },
			],
		} );

		state = reducer( state, {
			type: PURCHASES_SITE_FETCH_COMPLETED,
			purchases: [
				{ ID: '2', blog_id: siteId, user_id: userId, other: true },
				{ ID: '3', blog_id: siteId, user_id: userId },
			],
			siteId: Number( siteId ),
		} );

		expect( state ).toEqual( {
			data: [
				{ ID: '1', blog_id: siteId2, user_id: userId },
				{ ID: '2', blog_id: siteId, user_id: userId, other: true },
				{ ID: '3', blog_id: siteId, user_id: userId },
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		} );
	} );

	test( 'should only remove purchases missing from the new purchases array with the same `user_id` or `blog_id`', () => {
		let state = {
			data: [
				{ ID: '2', blog_id: siteId, user_id: userId },
				{ ID: '3', blog_id: siteId, user_id: userId },
				{ ID: '1', blog_id: siteId, user_id: userId },
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		};

		const newPurchase = { ID: '4', blog_id: 2702, user_id: userId };

		state = reducer( state, {
			type: PURCHASES_USER_FETCH_COMPLETED,
			purchases: [
				{ ID: '1', blog_id: siteId, user_id: userId },
				{ ID: '2', blog_id: siteId, user_id: userId },
				newPurchase, // include purchase with new `siteId`
			],
			userId: Number( userId ),
		} );

		expect( state ).toEqual( {
			data: [
				{ ID: '1', blog_id: siteId, user_id: userId },
				{ ID: '2', blog_id: siteId, user_id: userId },
				newPurchase, // purchase with ID 3 was removed, `newPurchase` was added
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		} );

		state = reducer( state, {
			type: PURCHASES_SITE_FETCH_COMPLETED,
			purchases: [ { ID: '2', blog_id: siteId, user_id: userId } ],
			siteId: Number( siteId ),
		} );

		expect( state ).toEqual( {
			data: [
				{ ID: '2', blog_id: siteId, user_id: userId },
				{ ID: '4', blog_id: 2702, user_id: userId }, // the new purchase was not removed because it has a different `blog_id`
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		} );

		state = reducer( state, {
			type: PURCHASE_REMOVE_COMPLETED,
			purchases: [ state.data[ 0 ] ],
			userId,
		} );

		expect( state ).toEqual( {
			data: [ { ID: '2', blog_id: siteId, user_id: userId } ],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		} );
	} );
} );
