/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import PaginatedQueryKey from '../key';

describe( 'PaginatedQueryKey', () => {
	describe( '.stringify()', () => {
		it( 'should return a JSON string of the object', () => {
			const key = PaginatedQueryKey.stringify( { ok: true } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should omit pagination query parameters', () => {
			const key = PaginatedQueryKey.stringify( { ok: true, page: 2 } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );
	} );

	describe( '.parse()', () => {
		it( 'should return an object of the JSON string', () => {
			const query = PaginatedQueryKey.parse( '[["ok",true]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		it( 'should omit pagination query parameters', () => {
			const query = PaginatedQueryKey.parse( '[["ok",true],["page",2]]' );

			expect( query ).to.eql( { ok: true } );
		} );
	} );
} );
