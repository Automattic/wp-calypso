/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_REQUESTING,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_SUCCESS,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_FAIL,
} from 'state/action-types';

import { items, requesting } from '../reducer';

describe( 'reducer', () => {
	describe( 'requesting()', () => {
		it( 'defaults to an empty object', () => {
			const state = requesting( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'sets the site to true when requesting', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_REQUESTING,
				siteId: 12345,
			};
			const state = requesting( {}, action );
			expect( state ).to.eql( { 12345: true } );
		} );

		it( 'sets the site to false when successful', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_SUCCESS,
				siteId: 12345,
			};
			const state = requesting( {}, action );
			expect( state ).to.eql( { 12345: false } );
		} );

		it( 'sets the site to false when a failure occurs', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_FAIL,
				siteId: 12345,
			};
			const state = requesting( {}, action );
			expect( state ).to.eql( { 12345: false } );
		} );
	} );

	describe( 'items()', () => {
		it( 'defaults to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		it( 'adds products when received', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
				siteId: 12345,
				products: [ { ID: 'best-product' }, { ID: 'worst-product' } ],
			};
			const state = items( {}, action );
			expect( state ).to.eql( { 12345: action.products } );
		} );

		it( 'replaces products with the same siteId when received', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
				siteId: 12345,
				products: [ { ID: 'best-product' }, { ID: 'worst-product' } ],
			};
			const state = items( { 12345: [ { ID: 'cool-thing' } ] }, action );
			expect( state[ 12345 ] ).to.eql( action.products );
		} );

		it( 'deletes products matching the ID when deleted', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
				siteId: 12345,
				productId: 'best-product',
			};
			const initialState = { 12345: [ { ID: 'cool-thing' }, { ID: 'best-product' }, { ID: 'worst-product' } ] };
			const state = items( initialState, action );
			expect( state[ 12345 ] ).to.eql( [ { ID: 'cool-thing' }, { ID: 'worst-product' } ] );
		} );

		it( 'updates products matching the ID when updated', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
				siteId: 12345,
				product: { ID: 'best-product', flavor: 'blue' },
			};
			const initialState = {
				12345: [ { ID: 'cool-thing' }, { ID: 'best-product', flavor: 'green' }, { ID: 'worst-product' } ],
			};
			const state = items( initialState, action );
			expect( state[ 12345 ] ).to.eql( [ { ID: 'cool-thing' }, { ID: 'best-product', flavor: 'blue' }, { ID: 'worst-product' } ] );
		} );

		it( 'adds product to front if product does not exist when updated', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
				siteId: 12345,
				product: { ID: 'new-product' },
			};
			const initialState = {
				12345: [ { ID: 'cool-thing' }, { ID: 'best-product' }, { ID: 'worst-product' } ],
			};
			const state = items( initialState, action );
			expect( state[ 12345 ] ).to.eql( [ action.product, { ID: 'cool-thing' }, { ID: 'best-product' }, { ID: 'worst-product' } ] );
		} );

		it( 'adds product if product does not exist when updated and state is empty', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
				siteId: 12345,
				product: { ID: 'new-product' },
			};
			const state = items( {}, action );
			expect( state[ 12345 ] ).to.eql( [ action.product ] );
		} );
	} );
} );
