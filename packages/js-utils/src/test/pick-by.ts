import pickBy from '../pick-by';

describe( 'pickBy', () => {
	it( 'keeps entries for which the predicate is truthy, passing value and key', () => {
		expect(
			pickBy( { a: 1, b: 2, c: 3 }, ( value, key ) => key !== 'b' && value < 3 )
		).toStrictEqual( { a: 1 } );
	} );

	it( 'keeps truthy values by default', () => {
		expect( pickBy( { a: 0, b: 1, c: '', d: 'x' } ) ).toStrictEqual( { b: 1, d: 'x' } );
	} );

	it( 'copies values by reference (shallow)', () => {
		const nested = { x: 1 };
		expect( pickBy( { nested, skip: 0 } ).nested ).toBe( nested );
	} );

	it( 'returns an empty object for a nullish source', () => {
		const nullable: Record< string, number > | null | undefined = null;
		expect( pickBy( nullable ) ).toStrictEqual( {} );
	} );

	it( 'keeps an own `__proto__` key as data without polluting the prototype', () => {
		const input = JSON.parse( '{ "__proto__": { "polluted": true }, "a": 1 }' );
		const result = pickBy( input );
		expect( Object.getPrototypeOf( result ) ).toBe( Object.prototype );
		expect( Object.hasOwn( result, '__proto__' ) ).toBe( true );
	} );
} );
