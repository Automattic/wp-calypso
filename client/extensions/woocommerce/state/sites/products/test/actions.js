/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { deleteProduct } from '../actions';
import product from './fixtures/product';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_ERROR_SET,
	WOOCOMMERCE_PRODUCT_DELETE,
	WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#deleteProduct()', () => {
		const siteId = '123';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.post( '/rest/v1.1/jetpack-blogs/123/rest-api/', {
					path: '/wc/v3/products/523&force=true&_via_calypso&_method=delete',
					json: true,
				} )
				.reply( 200, {
					data: product,
				} );
		} );

		test( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			deleteProduct( siteId, 1 )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( {
				type: WOOCOMMERCE_PRODUCT_DELETE,
				siteId,
				productId: 1,
			} );
		} );

		test( 'should dispatch a success action with deleted product data when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = deleteProduct( siteId, 523 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_PRODUCT_DELETE_SUCCESS,
					siteId,
					data: product,
				} );
			} );
		} );

		test( 'should dispatch an error when the request fails', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = deleteProduct( 234, 511 )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( { type: WOOCOMMERCE_ERROR_SET } );
			} );
		} );
	} );
} );
