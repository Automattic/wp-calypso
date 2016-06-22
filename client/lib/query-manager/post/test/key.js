/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import PostQueryKey from '../key';

describe( 'PostQueryKey', () => {
	describe( '.stringify()', () => {
		it( 'should return a JSON string of the object', () => {
			const key = PostQueryKey.stringify( { ok: true } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should omit default post query parameters', () => {
			const key = PostQueryKey.stringify( { ok: true, type: 'post' } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should omit null query values', () => {
			const key = PostQueryKey.stringify( { ok: true, search: null } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should omit undefined query values', () => {
			const key = PostQueryKey.stringify( { ok: true, search: undefined } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );
	} );

	describe( '.parse()', () => {
		it( 'should return an object of the JSON string', () => {
			const query = PostQueryKey.parse( '[["ok",true]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		it( 'should omit default post query parameters', () => {
			const query = PostQueryKey.parse( '[["ok",true],["type","post"]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		it( 'should omit null query values', () => {
			const query = PostQueryKey.parse( '[["ok",true],["search",null]]' );

			expect( query ).to.eql( { ok: true } );
		} );
	} );
} );
