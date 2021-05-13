/**
 * Internal dependencies
 */
import ThemeQueryKey from '../key';

describe( 'ThemeQueryKey', () => {
	describe( '.stringify()', () => {
		test( 'should return a JSON string of the object', () => {
			const key = ThemeQueryKey.stringify( { ok: true } );

			expect( key ).toBe( '[["ok",true]]' );
		} );

		test( 'should omit default theme query parameters', () => {
			const key = ThemeQueryKey.stringify( { ok: true, tier: '' } );

			expect( key ).toBe( '[["ok",true]]' );
		} );

		test( 'should omit null query values', () => {
			const key = ThemeQueryKey.stringify( { ok: true, search: null } );

			expect( key ).toBe( '[["ok",true]]' );
		} );

		test( 'should omit undefined query values', () => {
			const key = ThemeQueryKey.stringify( { ok: true, search: undefined } );

			expect( key ).toBe( '[["ok",true]]' );
		} );
	} );

	describe( '.parse()', () => {
		test( 'should return an object of the JSON string', () => {
			const query = ThemeQueryKey.parse( '[["ok",true]]' );

			expect( query ).toEqual( { ok: true } );
		} );

		test( 'should omit default theme query parameters', () => {
			const query = ThemeQueryKey.parse( '[["ok",true],["tier",""]]' );

			expect( query ).toEqual( { ok: true } );
		} );

		test( 'should omit null query values', () => {
			const query = ThemeQueryKey.parse( '[["ok",true],["search",null]]' );

			expect( query ).toEqual( { ok: true } );
		} );
	} );
} );
