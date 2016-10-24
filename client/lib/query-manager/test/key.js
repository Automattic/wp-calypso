/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import QueryKey from '../key';

describe( 'QueryKey', () => {
	describe( '.stringify()', () => {
		it( 'should return a JSON string of the object', () => {
			const key = QueryKey.stringify( { ok: true } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should return the same string for two objects with different property creation order', () => {
			const original = QueryKey.stringify( { a: 1, b: 2 } );
			const reversed = QueryKey.stringify( { b: 2, a: 1 } );

			expect( original ).to.equal( reversed );
		} );
	} );

	describe( '.parse()', () => {
		it( 'should return an object of the JSON string', () => {
			const query = QueryKey.parse( '[["ok",true]]' );

			expect( query ).to.eql( { ok: true } );
		} );
	} );
} );
