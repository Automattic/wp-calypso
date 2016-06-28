// External dependencies
import { expect } from 'chai';
import { nock, useNock } from 'test/helpers/use-nock';
import sinon from 'sinon';

// Internal dependencies
import {
	PRIVACY_PROTECTION_CANCEL,
	PRIVACY_PROTECTION_CANCEL_COMPLETED,
	PRIVACY_PROTECTION_CANCEL_FAILED,
	PURCHASES_REMOVE,
	PURCHASES_SITE_FETCH,
	PURCHASES_SITE_FETCH_COMPLETED,
	PURCHASES_SITE_FETCH_FAILED,
	PURCHASES_USER_FETCH,
	PURCHASES_USER_FETCH_COMPLETED,
	PURCHASE_REMOVE,
	PURCHASE_REMOVE_COMPLETED,
} from 'state/action-types';
import useMockery from 'test/helpers/use-mockery';
import purchasesAssembler from 'lib/purchases/assembler';

describe( 'actions', () => {
	const purchases = [ { id: 1 } ],
		assembledPurchases = purchasesAssembler.createPurchasesArray( purchases ),
		userId = 1337,
		purchaseId = 31337;

	useNock();

	let fetchUserPurchases, removePurchase;
	useMockery( mockery => {
		mockery.registerMock( 'lib/olark', () => ( { } ) );

		const actions = require( '../actions' );

		fetchUserPurchases = actions.fetchUserPurchases;
		removePurchase = actions.removePurchase;
	} );

	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#fetchUserPurchases', () => {
		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/me/purchases' )
				.reply( 200, purchases );
		} );

		it( 'should dispatch fetch/complete actions', () => {
			const promise = fetchUserPurchases( 1337 )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PURCHASES_USER_FETCH
			} );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PURCHASES_USER_FETCH_COMPLETED,
					userId,
					purchases: assembledPurchases
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
			const promise = removePurchase( purchaseId, userId )( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PURCHASE_REMOVE,
				purchaseId
			} );

			return promise.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PURCHASE_REMOVE_COMPLETED,
					purchases: assembledPurchases,
					userId
				} );
			} );
		} );
	} );
} );
