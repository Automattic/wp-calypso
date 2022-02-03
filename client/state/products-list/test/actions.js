import { expect } from 'chai';
import sinon from 'sinon';
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'calypso/state/action-types';
import useNock from 'calypso/test-helpers/use-nock';
import { receiveProductsList, requestProductsList } from '../actions';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	const businessPlan = {
		product_id: 1008,
		product_name: 'WordPress.com Business',
		product_slug: 'business-bundle',
		is_domain_registration: false,
		description: '',
		cost: 300,
		cost_display: '$300',
	};

	describe( '#receiveProductsList()', () => {
		test( 'should return an action object', () => {
			const action = receiveProductsList( { businessPlan } );

			expect( action ).to.eql( {
				type: PRODUCTS_LIST_RECEIVE,
				productsList: { businessPlan },
				productsListType: null,
			} );
		} );
	} );

	describe( '#requestProductsList()', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/products' )
				.twice()
				.reply( 200, { businessPlan } )
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
					productsList: { businessPlan },
					productsListType: null,
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
