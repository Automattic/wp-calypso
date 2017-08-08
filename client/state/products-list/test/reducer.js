/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import { useSandbox } from 'test/helpers/use-sinon';
import {
	DESERIALIZE,
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
	SERIALIZE,
} from 'state/action-types';
import reducer, {
	items,
	isFetching,
} from '../reducer';

describe( 'reducer', () => {
	useSandbox( ( sandbox ) => {
		sandbox.stub( console, 'warn' );
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'isFetching'
		] );
	} );

	describe( '#items()', () => {
		it( 'should default to empty object', () => {
			const state = items( undefined, {} );

			expect( state ).to.eql( {} );
		} );

		it( 'should store the product list received', () => {
			const productsList = [ {
				guided_transfer: {
					available: true,
					product_id: 40,
					product_name: 'Guided Transfer',
					product_slug: 'guided_transfer',
					prices: { USD: 129, AUD: 169 },
					is_domain_registration: false,
					description: 'Guided Transfer',
					cost: 129,
					cost_display: '$129',
				}
			} ];

			const state = items( {}, {
				type: PRODUCTS_LIST_RECEIVE,
				productsList
			} );

			expect( state ).to.eql( productsList );
		} );

		describe( 'persistence', () => {
			it( 'persists state', () => {
				const original = deepFreeze( {
					guided_transfer: {
						available: true,
						product_id: 40,
						product_name: 'Guided Transfer',
						product_slug: 'guided_transfer',
						prices: { USD: 129, AUD: 169 },
						is_domain_registration: false,
						description: 'Guided Transfer',
						cost: '129',
						cost_display: '$129',
					}
				} );
				const state = items( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads valid persisted state', () => {
				const original = deepFreeze( {
					guided_transfer: {
						available: true,
						product_id: 40,
						product_name: 'Guided Transfer',
						product_slug: 'guided_transfer',
						prices: { USD: 129, AUD: 169 },
						is_domain_registration: false,
						description: 'Guided Transfer',
						cost: '129',
						cost_display: '$129',
					}
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					guided_transfer: {
						available: true,
						id: 40,
						name: 'Guided Transfer',
						slug: 'guided_transfer',
					}
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( {} );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		it( 'should default to false', () => {
			const state = isFetching( undefined, {} );

			expect( state ).to.eql( false );
		} );

		it( 'should be true after a request begins', () => {
			const state = isFetching( false, { type: PRODUCTS_LIST_REQUEST } );
			expect( state ).to.eql( true );
		} );

		it( 'should be false when a request completes', () => {
			const state = isFetching( true, { type: PRODUCTS_LIST_RECEIVE } );
			expect( state ).to.eql( false );
		} );

		it( 'should be false when a request fails', () => {
			const state = isFetching( true, { type: PRODUCTS_LIST_REQUEST_FAILURE } );
			expect( state ).to.eql( false );
		} );

		it( 'should never persist state', () => {
			const state = isFetching( true, { type: SERIALIZE } );

			expect( state ).to.eql( false );
		} );

		it( 'should never load persisted state', () => {
			const state = isFetching( true, { type: DESERIALIZE } );

			expect( state ).to.eql( false );
		} );
	} );
} );
