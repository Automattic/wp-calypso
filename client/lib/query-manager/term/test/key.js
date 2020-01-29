/**
 * Internal dependencies
 */
import TermQueryKey from '../key';

describe( 'TermQueryKey', () => {
	describe( '.stringify()', () => {
		test( 'should return a JSON string of the object', () => {
			const key = TermQueryKey.stringify( { ok: true } );

			expect( key ).toBe( '[["ok",true]]' );
		} );

		test( 'should omit default post query parameters', () => {
			const key = TermQueryKey.stringify( { ok: true, search: '' } );

			expect( key ).toBe( '[["ok",true]]' );
		} );

		test( 'should omit null query values', () => {
			const key = TermQueryKey.stringify( { ok: true, search: null } );

			expect( key ).toBe( '[["ok",true]]' );
		} );

		test( 'should omit undefined query values', () => {
			const key = TermQueryKey.stringify( { ok: true, search: undefined } );

			expect( key ).toBe( '[["ok",true]]' );
		} );
	} );

	describe( '.parse()', () => {
		test( 'should return an object of the JSON string', () => {
			const query = TermQueryKey.parse( '[["ok",true]]' );

			expect( query ).toEqual( { ok: true } );
		} );

		test( 'should omit default post query parameters', () => {
			const query = TermQueryKey.parse( '[["ok",true],["search",""]]' );

			expect( query ).toEqual( { ok: true } );
		} );

		test( 'should omit null query values', () => {
			const query = TermQueryKey.parse( '[["ok",true],["search",null]]' );

			expect( query ).toEqual( { ok: true } );
		} );
	} );
} );
