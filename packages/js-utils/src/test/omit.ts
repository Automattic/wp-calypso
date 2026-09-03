import omit from '../omit';

describe( 'omit', () => {
	const object = { a: 1, b: 2, c: 3 };

	it( 'omits the given keys, whether passed as an array or variadically', () => {
		expect( omit( object, [ 'a', 'c' ] ) ).toStrictEqual( { b: 2 } );
		expect( omit( object, 'a', 'c' ) ).toStrictEqual( { b: 2 } );
	} );

	it( 'accepts a single key', () => {
		expect( omit( object, 'b' ) ).toStrictEqual( { a: 1, c: 3 } );
	} );

	it( 'matches a numeric key against a string-keyed object', () => {
		expect( omit( { 123: 'x', 456: 'y' }, 123 ) ).toStrictEqual( { 456: 'y' } );
	} );

	it( 'leaves keys absent from the source as a no-op', () => {
		expect( omit( object, 'missing' ) ).toStrictEqual( object );
	} );

	it( 'preserves enumerable symbol properties', () => {
		const sym = Symbol( 'keep' );
		expect( omit( { a: 1, [ sym ]: 2 }, 'a' ) ).toStrictEqual( { [ sym ]: 2 } );
	} );

	it( 'returns a shallow copy without mutating the source', () => {
		const nested = { x: 1 };
		const source = { a: nested, b: 2 };
		const result = omit( source, 'b' );
		expect( source ).toStrictEqual( { a: nested, b: 2 } );
		expect( result.a ).toBe( nested );
	} );

	it( 'returns an empty object for a nullish source', () => {
		const nullable: typeof object | null | undefined = undefined;
		expect( omit( nullable, 'a' ) ).toStrictEqual( {} );
	} );
} );
