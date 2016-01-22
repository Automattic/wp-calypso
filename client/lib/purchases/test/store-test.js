/**
 * External dependencies
 */
import { expect } from 'chai';
import Dispatcher from 'dispatcher';
import defer from 'lodash/function/defer';

/**
 * Internal dependencies
 */
import { action as actionTypes } from 'lib/upgrades/constants';
import PurchasesStore from '../store';

describe( 'Purchases Store', () => {
	const userId = 1337,
		siteId = 2701;

	it( 'should be an object', () => {
		expect( PurchasesStore ).to.be.an( 'object' );
	} );

	it( 'should return an object with the initial state', () => {
		expect( PurchasesStore.get() ).to.be.eql( {
			data: [],
			error: null,
			hasLoadedFromServer: false,
			isFetching: false
		} );
	} );

	it( 'should return an object with an empty list and fetching enabled when fetching is triggered', () => {
		Dispatcher.handleViewAction( {
			type: actionTypes.PURCHASES_USER_FETCH
		} );

		expect( PurchasesStore.get() ).to.be.eql( {
			data: [],
			error: null,
			hasLoadedFromServer: false,
			isFetching: true
		} );
	} );

	it( 'should return an object with the list of purchases when fetching completed', done => {
		Dispatcher.handleServerAction( {
			type: actionTypes.PURCHASES_USER_FETCH_COMPLETED,
			purchases: [ { id: 1, siteId, userId }, { id: 2, siteId, userId } ]
		} );

		defer( () => {
			Dispatcher.handleServerAction( {
				type: actionTypes.PURCHASES_SITE_FETCH_COMPLETED,
				purchases: [ { id: 2, siteId, userId }, { id: 3, siteId, userId } ]
			} );

			expect( PurchasesStore.get() ).to.be.eql( {
				data: [
					{ id: 2, siteId, userId },
					{ id: 3, siteId, userId },
					{ id: 1, siteId, userId } ],
				error: null,
				hasLoadedFromServer: true,
				isFetching: false
			} );

			done();
		} );
	} );

	it( 'should only remove purchases missing from the new purchases array with the same `userId` or `siteId`', done => {
		const newPurchase = { id: 4, siteId: 2702, userId };

		expect( PurchasesStore.getByPurchaseId( 3 ) ).to.exist;

		Dispatcher.handleServerAction( {
			type: actionTypes.PURCHASES_USER_FETCH_COMPLETED,
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
			hasLoadedFromServer: true,
			isFetching: false
		} );

		defer( () => {
			Dispatcher.handleServerAction( {
				type: actionTypes.PURCHASES_SITE_FETCH_COMPLETED,
				purchases: [ { id: 2, siteId, userId } ],
				siteId
			} );

			expect( PurchasesStore.get() ).to.be.eql( {
				data: [
					{ id: 2, siteId, userId },
					newPurchase // the new purchase was not removed because it has a different `siteId`
				],
				error: null,
				hasLoadedFromServer: true,
				isFetching: false
			} );

			done();
		} );
	} );

	it( 'should return an object with original purchase when cancelation of private registration is triggered', () => {
		Dispatcher.handleServerAction( {
			type: actionTypes.PRIVACY_PROTECTION_CANCEL,
			purchaseId: 2
		} );

		expect( PurchasesStore.getByPurchaseId( 2 ) ).to.be.eql( {
			data: { id: 2, siteId, userId },
			error: null,
			hasLoadedFromServer: true,
			isFetching: false
		} );
	} );

	it( 'should return an object with original purchase and error message when cancelation of private registration failed', () => {
		Dispatcher.handleServerAction( {
			type: actionTypes.PRIVACY_PROTECTION_CANCEL_FAILED,
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
			hasLoadedFromServer: true,
			isFetching: false
		} );
	} );

	it( 'should return an object with updated purchase when cancelation of private registration completed', () => {
		Dispatcher.handleServerAction( {
			type: actionTypes.PRIVACY_PROTECTION_CANCEL_COMPLETED,
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
			hasLoadedFromServer: true,
			isFetching: false
		} );
	} );
} );
