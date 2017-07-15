/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { fetchProductCategories } from '../actions';
import useNock from 'test/helpers/use-nock';
import {
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST,
	WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
	WOOCOMMERCE_ERROR_SET,
} from 'woocommerce/state/action-types';

describe( 'actions', () => {
	describe( '#fetchProductCategories()', () => {
		const siteId = '123';
		const errorSiteId = '234';

		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.persist()
				.get( '/rest/v1.1/jetpack-blogs/123/rest-api/' )
				.query( { path: '/wc/v3/products/categories' } )
				.reply( 200, {
					data: [ {
						id: 10,
						name: 'Tops',
						slug: 'tops',
						description: '',
						display: 'default',
					} ]
				} )
				.get( '/rest/v1.1/jetpack-blogs/234/rest-api/' )
				.query( { path: '/wc/v2/products/categories' } )
				.reply( 200, {
					data: [ {
						id: '1',
						name: 'Error',
						slug: false,
						description: '',
						display: 'default',
					} ]
				} );
		} );

		it( 'should dispatch an action', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			fetchProductCategories( siteId )( dispatch, getState );
			expect( dispatch ).to.have.been.calledWith( { type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST, siteId } );
		} );

		it( 'should dispatch a success action with product category information when request completes', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProductCategories( siteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWith( {
					type: WOOCOMMERCE_PRODUCT_CATEGORIES_REQUEST_SUCCESS,
					siteId,
					data: [ {
						id: 10,
						name: 'Tops',
						slug: 'tops',
						description: '',
						display: 'default',
					} ]
				} );
			} );
		} );

		it( 'should dispatch error action if the data is invalid', () => {
			const getState = () => ( {} );
			const dispatch = spy();
			const response = fetchProductCategories( errorSiteId )( dispatch, getState );

			return response.then( () => {
				expect( dispatch ).to.have.been.calledWithMatch( { type: WOOCOMMERCE_ERROR_SET } );
			} );
		} );
	} );
} );
