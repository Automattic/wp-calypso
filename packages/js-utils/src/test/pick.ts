import pick from '../pick';

describe( 'pick', () => {
	const object = { a: 1, b: 2, c: 3 };

	it( 'picks the given keys, whether passed as an array or variadically', () => {
		expect( pick( object, [ 'a', 'c' ] ) ).toStrictEqual( { a: 1, c: 3 } );
		expect( pick( object, 'a', 'c' ) ).toStrictEqual( { a: 1, c: 3 } );
	} );

	it( 'skips keys absent from the source', () => {
		expect( pick( object, [ 'a', 'missing' ] ) ).toStrictEqual( { a: 1 } );
	} );

	it( 'matches numeric keys against a string-keyed object', () => {
		expect( pick( { 930: 'x', 973: 'y', 1: 'z' }, [ 930, 973 ] ) ).toStrictEqual( {
			930: 'x',
			973: 'y',
		} );
	} );

	it( 'copies values by reference (shallow)', () => {
		const nested = { x: 1 };
		expect( pick( { nested, other: 2 }, 'nested' ).nested ).toBe( nested );
	} );

	it( 'returns an empty object for a nullish source', () => {
		const nullable: typeof object | null | undefined = null;
		expect( pick( nullable, 'a' ) ).toStrictEqual( {} );
	} );
} );
