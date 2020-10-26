/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveProductsList, requestProductsList } from '../actions';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import useNock from 'calypso/test-helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	const guided_transfer = {
		product_id: 40,
		product_name: 'Guided Transfer',
		product_slug: 'guided_transfer',
		prices: { USD: 129, AUD: 169 },
		is_domain_registration: false,
		description: 'Guided Transfer',
		cost: 129,
		cost_display: '$129',
	};

	describe( '#receiveProductsList()', () => {
		test( 'should return an action object', () => {
			const action = receiveProductsList( { guided_transfer } );

			expect( action ).to.eql( {
				type: PRODUCTS_LIST_RECEIVE,
				productsList: { guided_transfer },
			} );
		} );
	} );

	describe( '#requestProductsList()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/products' )
				.twice()
				.reply( 200, { guided_transfer } )
				.get( '/rest/v1.1/products' )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		test( 'should dispatch fetch action when thunk triggered', () => {
			requestProductsList()( spy );

			expect( spy ).to.have.been.calledWith( { type: PRODUCTS_LIST_REQUEST } );
		} );

		test( 'should dispatch product list receive action when request completes', () => {
			return requestProductsList()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PRODUCTS_LIST_RECEIVE,
					productsList: { guided_transfer },
				} );
			} );
		} );

		test( 'should dispatch fail action when request fails', () => {
			return requestProductsList()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PRODUCTS_LIST_REQUEST_FAILURE,
					error: sinon.match( { message: 'A server error occurred' } ),
				} );
			} );
		} );
	} );
} );
