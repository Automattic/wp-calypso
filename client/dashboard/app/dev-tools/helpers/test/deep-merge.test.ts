import { buildPartialUpdate } from '../deep-merge';

describe( 'buildPartialUpdate', () => {
	it( 'should build a single-level object', () => {
		const result = buildPartialUpdate( [ 'a' ], 10 );

		expect( result ).toEqual( { a: 10 } );
	} );

	it( 'should build a nested object from path', () => {
		const result = buildPartialUpdate( [ 'a', 'b', 'c' ], 10 );

		expect( result ).toEqual( { a: { b: { c: 10 } } } );
	} );

	it( 'should handle empty path by returning the value', () => {
		const result = buildPartialUpdate( [], { a: 1 } );

		expect( result ).toEqual( { a: 1 } );
	} );

	it( 'should handle various value types', () => {
		expect( buildPartialUpdate( [ 'str' ], 'hello' ) ).toEqual( { str: 'hello' } );
		expect( buildPartialUpdate( [ 'num' ], 42 ) ).toEqual( { num: 42 } );
		expect( buildPartialUpdate( [ 'bool' ], true ) ).toEqual( { bool: true } );
		expect( buildPartialUpdate( [ 'arr' ], [ 1, 2 ] ) ).toEqual( { arr: [ 1, 2 ] } );
		expect( buildPartialUpdate( [ 'obj' ], { x: 1 } ) ).toEqual( { obj: { x: 1 } } );
	} );
} );
