/**
 * @jest-environment jsdom
 */
/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { clearPurchases, fetchSitePurchases, fetchUserPurchases, removePurchase } from '../actions';
import {
	PURCHASES_REMOVE,
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_USER_FETCH,
	PURCHASES_USER_FETCH_COMPLETED,
	PURCHASE_REMOVE_COMPLETED,
	PURCHASE_REMOVE_FAILED,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const purchases = [ { ID: 1 } ],
		userId = 1337,
		siteId = 1234,
		purchaseId = 31337;

	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	describe( '#clearPurchases', () => {
		test( 'should dispatch a `PURCHASES_REMOVE` action', () => {
			clearPurchases()( spy );
			expect( spy ).to.have.been.calledWith( {
				type: PURCHASES_REMOVE,
			} );
		} );
	} );

	describe( '#fetchSitePurchases', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( `/rest/v1.1/sites/${ siteId }/purchases` )
				.reply( 200, purchases );
		} );

		test( 'should dispatch fetch/complete actions', () => {
			const promise = fetchSitePurchases( siteId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PURCHASES_SITE_FETCH,
				siteId,
			} );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PURCHASES_SITE_FETCH_COMPLETED,
					siteId,
					purchases,
				} );
			} );
		} );
	} );

	describe( '#fetchUserPurchases', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/purchases' )
				.reply( 200, purchases );
		} );

		test( 'should dispatch fetch/complete actions', () => {
			const promise = fetchUserPurchases( userId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PURCHASES_USER_FETCH,
			} );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PURCHASES_USER_FETCH_COMPLETED,
					userId,
					purchases,
				} );
			} );
		} );
	} );

	describe( '#removePurchase success', () => {
		const response = { purchases };

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( `/rest/v1.1/me/purchases/${ purchaseId }/delete` )
				.reply( 200, response );
		} );

		test( 'should dispatch fetch/complete actions', () => {
			return removePurchase(
				purchaseId,
				userId
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PURCHASE_REMOVE_COMPLETED,
					purchases,
					userId,
				} );
			} );
		} );
	} );

	describe( '#removePurchase failure', () => {
		const errorMessage = 'Unable to delete the purchase because of internal error';
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( `/rest/v1.1/me/purchases/${ purchaseId }/delete` )
				.reply( 400, {
					error: 'server_error',
					message: errorMessage,
				} );
		} );

		test( 'should dispatch fetch/remove actions', () => {
			return removePurchase(
				purchaseId,
				userId
			)( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PURCHASE_REMOVE_FAILED,
					error: errorMessage,
				} );
			} );
		} );
	} );
} );
