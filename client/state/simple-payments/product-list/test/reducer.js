/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { items } from '../reducer';
import {
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
	SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
} from 'state/action-types';

describe( 'reducer', () => {
	describe( 'items()', () => {
		test( 'defaults to an empty object', () => {
			const state = items( undefined, {} );
			expect( state ).to.eql( {} );
		} );

		test( 'adds products when received', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
				siteId: 12345,
				products: [ { ID: 'best-product' }, { ID: 'worst-product' } ],
			};
			const state = items( {}, action );
			expect( state ).to.eql( { 12345: action.products } );
		} );

		test( 'replaces products with the same siteId when received', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE,
				siteId: 12345,
				products: [ { ID: 'best-product' }, { ID: 'worst-product' } ],
			};
			const state = items( { 12345: [ { ID: 'cool-thing' } ] }, action );
			expect( state[ 12345 ] ).to.eql( action.products );
		} );

		test( 'deletes products matching the ID when deleted', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_DELETE,
				siteId: 12345,
				productId: 'best-product',
			};
			const initialState = {
				12345: [ { ID: 'cool-thing' }, { ID: 'best-product' }, { ID: 'worst-product' } ],
			};
			const state = items( initialState, action );
			expect( state[ 12345 ] ).to.eql( [ { ID: 'cool-thing' }, { ID: 'worst-product' } ] );
		} );

		test( 'updates products matching the ID when updated', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
				siteId: 12345,
				product: { ID: 'best-product', flavor: 'blue' },
			};
			const initialState = {
				12345: [
					{ ID: 'cool-thing' },
					{ ID: 'best-product', flavor: 'green' },
					{ ID: 'worst-product' },
				],
			};
			const state = items( initialState, action );
			expect( state[ 12345 ] ).to.eql( [
				{ ID: 'cool-thing' },
				{ ID: 'best-product', flavor: 'blue' },
				{ ID: 'worst-product' },
			] );
		} );

		test( 'adds product to front if product does not exist when updated', () => {
			const action = {
				type: SIMPLE_PAYMENTS_PRODUCTS_LIST_RECEIVE_UPDATE,
				siteId: 12345,
				product: { ID: 'new-product' },
			};
			const initialState = {
				12345: [ { ID: 'cool-thing' }, { ID: 'best-product' }, { ID: 'worst-product' } ],
			};
			const state = items( initialState, action );
			expect( state[ 12345 ] ).to.eql( [
				action.product,
				{ ID: 'cool-thing' },
				{ ID: 'best-product' },
				{ ID: 'worst-product' },
			] );
		} );

		test( 'adds product if product does not exist when updated and state is empty', () => {
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
