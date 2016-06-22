/**
 * External dependencies
 */
import nock from 'nock';
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
	PRODUCTS_LIST_REQUEST_SUCCESS,
} from 'state/action-types';
import {
	receiveProductsList,
	requestProductsList,
} from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	after( () => {
		nock.cleanAll();
	} );

	describe( '#receiveProductsList()', () => {
		it( 'should return an action object', () => {
			const product = {
				guided_transfer: {
					product_id: 40,
					product_name: 'Guided Transfer',
					product_slug: 'guided_transfer',
					prices: { USD: 129, AUD: 169 },
					is_domain_registration: false,
					description: 'Guided Transfer',
					cost: 129,
					cost_display: '$129',
				}
			};
			const action = receiveProductsList( [ product ] );

			expect( action ).to.eql( {
				type: PRODUCTS_LIST_RECEIVE,
				productsList: [ product ]
			} );
		} );
	} );

	describe( '#requestProductsList()', () => {
		const product = {
			guided_transfer: {
				product_id: 40,
				product_name: 'Guided Transfer',
				product_slug: 'guided_transfer',
				prices: { USD: 129, AUD: 169 },
				is_domain_registration: false,
				description: 'Guided Transfer',
				cost: 129,
				cost_display: '$129',
			}
		};

		before( () => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/products' )
				.reply( 200, [ product ] )
				.get( '/rest/v1.1/products' )
				.reply( 200, [ product ] )
				.get( '/rest/v1.1/products' )
				.reply( 500, [ product ] );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestProductsList()( spy );

			expect( spy ).to.have.been.calledWith( {
				type: PRODUCTS_LIST_REQUEST,
			} );
		} );

		it( 'should dispatch product list receive action when request completes', () => {
			return requestProductsList()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PRODUCTS_LIST_RECEIVE,
					productsList: [ product ]
				} );
			} );
		} );

		it( 'should dispatch product list request success action when request completes', () => {
			return requestProductsList()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PRODUCTS_LIST_REQUEST_SUCCESS,
				} );
			} );
		} );

		it( 'should dispatch fail action when request fails', () => {
			return requestProductsList()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error: sinon.match( { message: 'A server error occurred' } )
				} );
			} );
		} );
	} );
} );
