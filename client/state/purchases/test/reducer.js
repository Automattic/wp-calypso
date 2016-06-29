/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	PURCHASES_USER_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_USER_FETCH_COMPLETED,
	PRIVACY_PROTECTION_CANCEL_COMPLETED,
	PRIVACY_PROTECTION_CANCEL_FAILED
} from 'state/action-types';
import { getByPurchaseId } from '../selectors';
import { items } from '../reducer';

describe( 'items', () => {
	const userId = 1337,
		siteId = 2701;

	it( 'should return an object with the initial state', () => {
		expect( items( undefined, { type: 'UNRELATED' } ) ).to.be.eql( {
			data: [],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: false,
			hasLoadedUserPurchasesFromServer: false
		} );
	} );

	it( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		expect( items( undefined, { type: PURCHASES_USER_FETCH } ) ).to.be.eql( {
			data: [],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: true,
			hasLoadedSitePurchasesFromServer: false,
			hasLoadedUserPurchasesFromServer: false
		} );
	} );

	it( 'should return an object with the list of purchases when fetching completed', () => {
		let state = items( undefined, {
			type: PURCHASES_USER_FETCH_COMPLETED,
			purchases: [ { id: 1, siteId, userId }, { id: 2, siteId, userId } ]
		} );

		state = items( state, {
			type: PURCHASES_SITE_FETCH_COMPLETED,
			purchases: [ { id: 2, siteId, userId }, { id: 3, siteId, userId } ]
		} );

		expect( state ).to.be.eql( {
			data: [
				{ id: 2, siteId, userId },
				{ id: 3, siteId, userId },
				{ id: 1, siteId, userId } ],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true
		} );
	} );

	it( 'should only remove purchases missing from the new purchases array with the same `userId` or `siteId`', () => {
		let state = {
			data: [
				{ id: 2, siteId, userId },
				{ id: 3, siteId, userId },
				{ id: 1, siteId, userId } ],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true
		};

		const newPurchase = { id: 4, siteId: 2702, userId };

		state = items( state, {
			type: PURCHASES_USER_FETCH_COMPLETED,
			purchases: [
				{ id: 1, siteId, userId },
				{ id: 2, siteId, userId },
				newPurchase // include purchase with new `siteId`
			],
			userId
		} );

		expect( state ).to.be.eql( {
			data: [
				{ id: 1, siteId, userId },
				{ id: 2, siteId, userId },
				newPurchase // purchase with ID 3 was removed, `newPurchase` was added
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true
		} );

		state = items( state, {
			type: PURCHASES_SITE_FETCH_COMPLETED,
			purchases: [ { id: 2, siteId, userId } ],
			siteId
		} );

		expect( state ).to.be.eql( {
			data: [
				{ id: 2, siteId, userId },
				{ id: 4, siteId: 2702, userId } // the new purchase was not removed because it has a different `siteId`
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true
		} );
	} );

	it( 'should return an object with original purchase and error message when cancelation of private registration failed', () => {
		let state = {
			data: [
				{ id: 2, siteId, userId },
				{ id: 4, siteId: 2702, userId } // the new purchase was not removed because it has a different `siteId`
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true
		};

		state = items( state, {
			type: PRIVACY_PROTECTION_CANCEL_FAILED,
			error: 'Unable to fetch stored cards',
			purchaseId: 2
		} );

		expect( getByPurchaseId( { purchases: state }, 2 ) ).to.be.eql( {
			id: 2,
			error: 'Unable to fetch stored cards',
			siteId,
			userId
		} );
	} );

	it( 'should return an object with updated purchase when cancelation of private registration completed', () => {
		let state = {
			data: [
				{ id: 2, siteId, userId },
				{ id: 4, siteId: 2702, userId }
			],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true
		};

		state = items( state, {
			type: PRIVACY_PROTECTION_CANCEL_COMPLETED,
			purchase: {
				amount: 2200,
				error: null,
				hasPrivateRegistration: false,
				id: 2,
				siteId,
				userId
			}
		} );

		expect( getByPurchaseId( { purchases: state }, 2 ) ).to.be.eql( {
			amount: 2200,
			error: null,
			hasPrivateRegistration: false,
			id: 2,
			siteId,
			userId
		} );
	} );
} );
