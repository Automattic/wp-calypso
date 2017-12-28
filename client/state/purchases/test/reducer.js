/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import reducer from '../reducer';
import {
	PURCHASE_REMOVE_COMPLETED,
	PURCHASES_USER_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_USER_FETCH_COMPLETED,
	PRIVACY_PROTECTION_CANCEL_COMPLETED,
	PRIVACY_PROTECTION_CANCEL_FAILED,
} from 'client/state/action-types';

describe( 'reducer', () => {
	const userId = '1337',
		siteId = '2701';

	test( 'should return an object with the initial state', () => {
		expect( reducer( undefined, { type: 'UNRELATED' } ) ).to.be.eql( {
			data: [],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: false,
			hasLoadedUserPurchasesFromServer: false,
		} );
	} );

	test( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		expect( reducer( undefined, { type: PURCHASES_USER_FETCH } ) ).to.be.eql( {
			data: [],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: true,
			hasLoadedSitePurchasesFromServer: false,
			hasLoadedUserPurchasesFromServer: false,
		} );
	} );

	test( 'should return an object with the list of purchases when fetching completed', () => {
		let state = reducer( undefined, {
			type: PURCHASES_USER_FETCH_COMPLETED,
			purchases: [
				{ ID: '1', blog_id: siteId, user_id: userId },
				{ ID: '2', blog_id: siteId, user_id: userId },
			],
		} );

		state = reducer( state, {
			type: PURCHASES_SITE_FETCH_COMPLETED,
			purchases: [
				{ ID: '2', blog_id: siteId, user_id: userId },
				{ ID: '3', blog_id: siteId, user_id: userId },
			],
		} );

		expect( state ).to.be.eql( {
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

		expect( state ).to.be.eql( {
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

		expect( state ).to.be.eql( {
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

		expect( state ).to.be.eql( {
			data: [ { ID: '2', blog_id: siteId, user_id: userId } ],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		} );
	} );

	test( 'should return an object with original purchase and error message when cancelation of privacy protection failed', () => {
		let state = {
			data: [
				{ ID: '2', blog_id: siteId, user_id: userId },
				{ ID: '4', blog_id: 2702, user_id: userId },
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		};

		state = reducer( state, {
			type: PRIVACY_PROTECTION_CANCEL_FAILED,
			error: 'Unable to fetch stored cards',
			purchaseId: '2',
		} );

		expect( state ).to.be.eql( {
			data: [
				{
					ID: '2',
					blog_id: siteId,
					user_id: userId,
					error: 'Unable to fetch stored cards',
				},
				{
					ID: '4',
					blog_id: 2702,
					user_id: userId,
				},
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		} );
	} );

	test( 'should return an object with updated purchase when cancelation of privacy protection completed', () => {
		let state = {
			data: [
				{ ID: '2', blog_id: siteId, user_id: userId },
				{ ID: '4', blog_id: 2702, user_id: userId },
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		};

		state = reducer( state, {
			type: PRIVACY_PROTECTION_CANCEL_COMPLETED,
			purchase: {
				ID: '2',
				blog_id: siteId,
				user_id: userId,
				amount: 2200,
				error: null,
				has_private_registration: false,
			},
		} );

		expect( state ).to.be.eql( {
			data: [
				{
					ID: '2',
					blog_id: siteId,
					user_id: userId,
					amount: 2200,
					error: null,
					has_private_registration: false,
				},
				{
					ID: '4',
					blog_id: 2702,
					user_id: userId,
				},
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true,
		} );
	} );
} );
