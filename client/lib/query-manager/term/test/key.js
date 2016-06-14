/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import TermQueryKey from '../key';

describe( 'TermQueryKey', () => {
	describe( '.stringify()', () => {
		it( 'should return a JSON string of the object', () => {
			const key = TermQueryKey.stringify( { ok: true } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should omit default post query parameters', () => {
			const key = TermQueryKey.stringify( { ok: true, search: '' } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );
	} );

	describe( '.parse()', () => {
		it( 'should return an object of the JSON string', () => {
			const query = TermQueryKey.parse( '[["ok",true]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		it( 'should omit default post query parameters', () => {
			const query = TermQueryKey.parse( '[["ok",true],["search",""]]' );

			expect( query ).to.eql( { ok: true } );
		} );
	} );
} );
