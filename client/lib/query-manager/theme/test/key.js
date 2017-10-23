/** @format */
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
		test( 'should return a JSON string of the object', () => {
			const key = ThemeQueryKey.stringify( { ok: true } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		test( 'should omit default theme query parameters', () => {
			const key = ThemeQueryKey.stringify( { ok: true, tier: '' } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		test( 'should omit null query values', () => {
			const key = ThemeQueryKey.stringify( { ok: true, search: null } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );

		test( 'should omit undefined query values', () => {
			const key = ThemeQueryKey.stringify( { ok: true, search: undefined } );

			expect( key ).to.equal( '[["ok",true]]' );
		} );
	} );

	describe( '.parse()', () => {
		test( 'should return an object of the JSON string', () => {
			const query = ThemeQueryKey.parse( '[["ok",true]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		test( 'should omit default theme query parameters', () => {
			const query = ThemeQueryKey.parse( '[["ok",true],["tier",""]]' );

			expect( query ).to.eql( { ok: true } );
		} );

		test( 'should omit null query values', () => {
			const query = ThemeQueryKey.parse( '[["ok",true],["search",null]]' );

			expect( query ).to.eql( { ok: true } );
		} );
	} );
} );
