/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { productsRequest, productsRequestSuccess } from '../list-reducer';
import {
	WOOCOMMERCE_PRODUCTS_REQUEST,
	WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
} from 'woocommerce/state/action-types';

describe( 'reducer', () => {
	describe( 'productsRequest', () => {
		test( 'should store the requested page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST,
				siteId: 123,
				params: { page: 3 },
			};
			const newState = productsRequest( undefined, action );
			expect( newState.requestedPage ).to.eql( 3 );
			expect( newState.requestedSearch ).to.be.null;
		} );
		test( 'should store the requested search', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST,
				siteId: 123,
				params: { search: 'example' },
			};
			const newState = productsRequest( undefined, action );
			expect( newState.requestedPage ).to.be.null;
			expect( newState.requestedSearch ).to.eql( 'example' );
		} );
		test( 'should update the requested query', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST,
				siteId: 123,
				params: { page: 2 },
			};
			const originalState = { requestedPage: 1, requestedSearch: null };
			const newState = productsRequest( originalState, action );
			expect( newState.requestedPage ).to.eql( 2 );
		} );
	} );

	describe( 'productsRequestSuccess', () => {
		test( 'should store the current page', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 2 },
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.currentPage ).to.eql( 2 );
			expect( newState.currentSearch ).to.eql( '' );
			expect( newState.requestedPage ).to.be.null;
			expect( newState.requestedSearch ).to.be.null;
		} );
		test( 'should store the current search', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { search: 'example' },
			};
			const newState = productsRequestSuccess( undefined, action );
			expect( newState.currentPage ).to.eql( 1 );
			expect( newState.currentSearch ).to.eql( 'example' );
			expect( newState.requestedPage ).to.be.null;
			expect( newState.requestedSearch ).to.be.null;
		} );
		test( 'should update the current query', () => {
			const action = {
				type: WOOCOMMERCE_PRODUCTS_REQUEST_SUCCESS,
				siteId: 123,
				params: { page: 2 },
			};
			const originalState = {
				requestedPage: 2,
				requestedSearch: null,
				currentPage: 1,
				currentSearch: '',
			};
			const newState = productsRequestSuccess( originalState, action );
			expect( newState.currentPage ).to.eql( 2 );
			expect( newState.currentSearch ).to.eql( '' );
			expect( newState.requestedPage ).to.be.null;
			expect( newState.requestedSearch ).to.be.null;
		} );
	} );
} );
