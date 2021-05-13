/**
 * Internal dependencies
 */
import PaginatedQueryKey from '../key';

describe( 'PaginatedQueryKey', () => {
	describe( '.stringify()', () => {
		test( 'should return a JSON string of the object', () => {
			const key = PaginatedQueryKey.stringify( { ok: true } );

			expect( key ).toBe( '[["ok",true]]' );
		} );

		test( 'should omit pagination query parameters', () => {
			const key = PaginatedQueryKey.stringify( { ok: true, page: 2 } );

			expect( key ).toBe( '[["ok",true]]' );
		} );
	} );

	describe( '.parse()', () => {
		test( 'should return an object of the JSON string', () => {
			const query = PaginatedQueryKey.parse( '[["ok",true]]' );

			expect( query ).toEqual( { ok: true } );
		} );

		test( 'should omit pagination query parameters', () => {
			const query = PaginatedQueryKey.parse( '[["ok",true],["page",2]]' );

			expect( query ).toEqual( { ok: true } );
		} );
	} );
} );
