// External dependencies
import { expect } from 'chai';
import { nock, useNock } from 'test/helpers/use-nock';
import sinon from 'sinon';

// Internal dependencies
import {
	PRIVACY_PROTECTION_CANCEL,
	PRIVACY_PROTECTION_CANCEL_COMPLETED,
	PURCHASES_REMOVE,
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_USER_FETCH,
	PURCHASES_USER_FETCH_COMPLETED,
	PURCHASE_REMOVE,
	PURCHASE_REMOVE_COMPLETED,
} from 'state/action-types';
import useMockery from 'test/helpers/use-mockery';

describe( 'actions', () => {
	const purchases = [ { ID: 1 } ],
		userId = 1337,
		siteId = 1234,
		purchaseId = 31337;

	useNock();

	let cancelPrivateRegistration,
		clearPurchases,
		fetchSitePurchases,
		fetchUserPurchases,
		removePurchase;
	useMockery( mockery => {
		mockery.registerMock( 'lib/olark', {
			updateOlarkGroupAndEligibility: () => {}
		} );

		const actions = require( '../actions' );

		cancelPrivateRegistration = actions.cancelPrivateRegistration;
		clearPurchases = actions.clearPurchases;
		fetchSitePurchases = actions.fetchSitePurchases;
		fetchUserPurchases = actions.fetchUserPurchases;
		removePurchase = actions.removePurchase;
	} );

	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#clearPurchases', () => {
		it( 'should return a `PURCHASES_REMOVE` action', () => {
			expect( clearPurchases() ).to.be.eql( {
				type: PURCHASES_REMOVE
			} );
		} );
	} );

	describe( '#cancelPrivateRegistration', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( `/rest/v1.1/upgrades/${ purchaseId }/cancel-privacy-protection` )
				.reply( 200, { upgrade: purchases[ 0 ] } );
		} );

		it( 'should dispatch fetch/complete actions', () => {
			const promise = cancelPrivateRegistration( purchaseId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PRIVACY_PROTECTION_CANCEL,
				purchaseId
			} );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PRIVACY_PROTECTION_CANCEL_COMPLETED,
					purchase: purchases[ 0 ]
				} );
			} );
		} );
	} );

	describe( '#fetchSitePurchases', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( `/rest/v1.1/sites/${ siteId }/purchases` )
				.reply( 200, purchases );
		} );

		it( 'should dispatch fetch/complete actions', () => {
			const promise = fetchSitePurchases( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PURCHASES_SITE_FETCH,
				siteId
			} );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PURCHASES_SITE_FETCH_COMPLETED,
					siteId,
					purchases
				} );
			} );
		} );
	} );

	describe( '#fetchUserPurchases', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/purchases' )
				.reply( 200, purchases );
		} );

		it( 'should dispatch fetch/complete actions', () => {
			const promise = fetchUserPurchases( userId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PURCHASES_USER_FETCH
			} );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PURCHASES_USER_FETCH_COMPLETED,
					userId,
					purchases
				} );
			} );
		} );
	} );

	describe( '#removePurchase', () => {
		const response = { purchases };

		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( `/rest/v1.1/me/purchases/${ purchaseId }/delete` )
				.reply( 200, response );
		} );

		it( 'should dispatch fetch/complete actions', () => {
			return removePurchase( purchaseId, userId )( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PURCHASE_REMOVE_COMPLETED,
					purchases,
					userId
				} );
			} );
		} );
	} );
} );
