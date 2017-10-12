/** @format */
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
		test( 'should return a JSON string of the object', () => {
			const key = PostQueryKey.stringify( { ok: true } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		test( 'should omit default post query parameters', () => {
			const key = PostQueryKey.stringify( { ok: true, type: 'post' } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		test( 'should omit null query values', () => {
			const key = PostQueryKey.stringify( { ok: true, search: null } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		test( 'should omit undefined query values', () => {
			const key = PostQueryKey.stringify( { ok: true, search: undefined } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );
	} );

	describe( '.parse()', () => {
		test( 'should return an object of the JSON string', () => {
			const query = PostQueryKey.parse( '[["ok",true]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		test( 'should omit default post query parameters', () => {
			const query = PostQueryKey.parse( '[["ok",true],["type","post"]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		test( 'should omit null query values', () => {
			const query = PostQueryKey.parse( '[["ok",true],["search",null]]' );

			expect( query ).to.eql( { ok: true } );
		} );
	} );
} );
