/**
 * External dependencies
 */
import { expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	DESERIALIZE,
	PRODUCTS_LIST_RECEIVE,
	PRODUCTS_LIST_REQUEST,
	PRODUCTS_LIST_REQUEST_FAILURE,
	PRODUCTS_LIST_REQUEST_SUCCESS,
	SERIALIZE,
} from 'state/action-types';
import reducer, {
	items,
	isFetching,
} from '../reducer';

describe( 'reducer', () => {
	before( () => {
		sinon.stub( console, 'warn' );
	} );

	after( () => {
		console.warn.restore();
	} );

	it( 'should include expected keys in return value', () => {
		expect( reducer( undefined, {} ) ).to.have.keys( [
			'items',
			'isFetching'
		] );
	} );

	describe( '#items()', () => {
		it( 'should default to null', () => {
			const state = items( undefined, {} );

			expect( state ).to.be.null;
		} );

		describe( 'persistence', () => {
			it( 'persists state', () => {
				const original = deepFreeze( {
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
				} );
				const state = items( original, { type: SERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads valid persisted state', () => {
				const original = deepFreeze( {
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
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( original );
			} );

			it( 'loads default state when schema does not match', () => {
				const original = deepFreeze( {
					guided_transfer: {
						id: 40,
						name: 'Guided Transfer',
						slug: 'guided_transfer',
					}
				} );
				const state = items( original, { type: DESERIALIZE } );
				expect( state ).to.eql( null );
			} );
		} );
	} );

	describe( '#isFetching()', () => {
		it( 'should default to false', () => {
			const state = isFetching( undefined, {} );

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
