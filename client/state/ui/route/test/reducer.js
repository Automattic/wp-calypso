/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import { ROUTE_SET } from 'state/action-types';
import { path, params } from '../reducer';

describe( 'reducer', () => {
	describe( '#path()', () => {
		it( 'should default to an empty string', () => {
			const state = path( undefined, {} );

			expect( state ).to.equal( '' );
		} );

		it( 'should properly set path', () => {
			const newState = path( undefined, { type: ROUTE_SET, path: '/foo' } );

			expect( newState ).to.equal( '/foo' );
		} );
	} );

	describe( '#params()', () => {
		it( 'should default to an empty object', () => {
			const state = params( undefined, {} );

			expect( state ).to.be.empty;
		} );

		it( 'should properly set params', () => {
			const newState = params( undefined, { type: ROUTE_SET, params: { foo: 'bar' } } );

			expect( newState ).to.eql( { foo: 'bar' } );
		} );
	} );
} );
