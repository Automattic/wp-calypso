/**
 * External dependencies
 */
import { expect } from 'chai';
import Dispatcher from 'dispatcher';
import defer from 'lodash/defer';

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
import PurchasesStore from '../store';

describe( 'store', () => {
	const userId = 1337,
		siteId = 2701;

	it( 'should be an object', () => {
		expect( PurchasesStore ).to.be.an( 'object' );
	} );

	it( 'should return an object with the initial state', () => {
		expect( PurchasesStore.get() ).to.be.eql( {
			data: [],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: false,
			hasLoadedUserPurchasesFromServer: false
		} );
	} );

	it( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		Dispatcher.handleViewAction( {
			type: PURCHASES_USER_FETCH
		} );

		expect( PurchasesStore.get() ).to.be.eql( {
			data: [],
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: true,
			hasLoadedSitePurchasesFromServer: false,
			hasLoadedUserPurchasesFromServer: false
		} );
	} );

	it( 'should return an object with the list of purchases when fetching completed', done => {
		Dispatcher.handleServerAction( {
			type: PURCHASES_USER_FETCH_COMPLETED,
			purchases: [ { id: 1, siteId, userId }, { id: 2, siteId, userId } ]
		} );

		defer( () => {
			Dispatcher.handleServerAction( {
				type: PURCHASES_SITE_FETCH_COMPLETED,
				purchases: [ { id: 2, siteId, userId }, { id: 3, siteId, userId } ]
			} );

			expect( PurchasesStore.get() ).to.be.eql( {
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

			done();
		} );
	} );

	it( 'should only remove purchases missing from the new purchases array with the same `userId` or `siteId`', done => {
		const newPurchase = { id: 4, siteId: 2702, userId };

		expect( PurchasesStore.getByPurchaseId( 3 ) ).to.exist;

		Dispatcher.handleServerAction( {
			type: PURCHASES_USER_FETCH_COMPLETED,
			purchases: [
				{ id: 1, siteId, userId },
				{ id: 2, siteId, userId },
				newPurchase // include purchase with new `siteId`
			],
			userId
		} );

		expect( PurchasesStore.get() ).to.be.eql( {
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

		defer( () => {
			Dispatcher.handleServerAction( {
				type: PURCHASES_SITE_FETCH_COMPLETED,
				purchases: [ { id: 2, siteId, userId } ],
				siteId
			} );

			expect( PurchasesStore.get() ).to.be.eql( {
				data: [
					{ id: 2, siteId, userId },
					newPurchase // the new purchase was not removed because it has a different `siteId`
				],
				error: null,
				isFetchingSitePurchases: false,
				isFetchingUserPurchases: false,
				hasLoadedSitePurchasesFromServer: true,
				hasLoadedUserPurchasesFromServer: true
			} );

			done();
		} );
	} );

	it( 'should return an object with original purchase when cancelation of private registration is triggered', () => {
		Dispatcher.handleServerAction( {
			type: 'PRIVACY_PROTECTION_CANCEL',
			purchaseId: 2
		} );

		expect( PurchasesStore.getByPurchaseId( 2 ) ).to.be.eql( {
			data: { id: 2, siteId, userId },
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true
		} );
	} );

	it( 'should return an object with original purchase and error message when cancelation of private registration failed', () => {
		Dispatcher.handleServerAction( {
			type: PRIVACY_PROTECTION_CANCEL_FAILED,
			error: 'Unable to fetch stored cards',
			purchaseId: 2
		} );

		expect( PurchasesStore.getByPurchaseId( 2 ) ).to.be.eql( {
			data: {
				id: 2,
				error: 'Unable to fetch stored cards',
				siteId,
				userId
			},
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true
		} );
	} );

	it( 'should return an object with updated purchase when cancelation of private registration completed', () => {
		Dispatcher.handleServerAction( {
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

		expect( PurchasesStore.getByPurchaseId( 2 ) ).to.be.eql( {
			data: {
				amount: 2200,
				error: null,
				hasPrivateRegistration: false,
				id: 2,
				siteId,
				userId
			},
			error: null,
			isFetchingSitePurchases: false,
			isFetchingUserPurchases: false,
			hasLoadedSitePurchasesFromServer: true,
			hasLoadedUserPurchasesFromServer: true
		} );
	} );
} );
