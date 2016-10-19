/**
 * External dependencies
 */
import sinon from 'sinon';
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
} from 'state/action-types';
import {
	receiveProductsList,
	requestProductsList,
} from '../actions';
import {
	guided_transfer,
} from './fixtures';
import useNock from 'test/helpers/use-nock';

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receiveProductsList()', () => {
		it( 'should return an action object', () => {
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
				.twice().reply( 200, { guided_transfer } )
				.get( '/rest/v1.1/products' )
				.reply( 500, {
					error: 'server_error',
					message: 'A server error occurred',
				} );
		} );

		it( 'should dispatch fetch action when thunk triggered', () => {
			requestProductsList()( spy );

			expect( spy ).to.have.been.calledWith( { type: PRODUCTS_LIST_REQUEST } );
		} );

		it( 'should dispatch product list receive action when request completes', () => {
			return requestProductsList()( spy ).then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: PRODUCTS_LIST_RECEIVE,
					productsList: { guided_transfer }
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
