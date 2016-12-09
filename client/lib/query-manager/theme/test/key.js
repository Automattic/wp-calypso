/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import ThemeQueryKey from '../key';

describe( 'ThemeQueryKey', () => {
	describe( '.stringify()', () => {
		it( 'should return a JSON string of the object', () => {
			const key = ThemeQueryKey.stringify( { ok: true } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should omit default theme query parameters', () => {
			const key = ThemeQueryKey.stringify( { ok: true, tier: '' } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should omit null query values', () => {
			const key = ThemeQueryKey.stringify( { ok: true, search: null } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		it( 'should omit undefined query values', () => {
			const key = ThemeQueryKey.stringify( { ok: true, search: undefined } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );
	} );

	describe( '.parse()', () => {
		it( 'should return an object of the JSON string', () => {
			const query = ThemeQueryKey.parse( '[["ok",true]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		it( 'should omit default theme query parameters', () => {
			const query = ThemeQueryKey.parse( '[["ok",true],["tier",""]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		it( 'should omit null query values', () => {
			const query = ThemeQueryKey.parse( '[["ok",true],["search",null]]' );

			expect( query ).to.eql( { ok: true } );
		} );
	} );
} );
