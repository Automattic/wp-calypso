import mapValues from '../map-values';

describe( 'mapValues', () => {
	it( 'maps each value, passing value and key to the iteratee', () => {
		expect( mapValues( { a: 1, b: 2 }, ( value, key ) => `${ key }${ value }` ) ).toStrictEqual( {
			a: 'a1',
			b: 'b2',
		} );
	} );

	it( 'returns an empty object for a nullish source', () => {
		const nullable: Record< string, number > | null | undefined = null;
		expect( mapValues( nullable, ( value ) => value ) ).toStrictEqual( {} );
	} );

	it( 'keeps an own `__proto__` key as data without polluting the prototype', () => {
		const input = JSON.parse( '{ "__proto__": { "polluted": true }, "a": 1 }' );
		const result = mapValues( input, ( value ) => value );
		expect( Object.getPrototypeOf( result ) ).toBe( Object.prototype );
		expect( Object.hasOwn( result, '__proto__' ) ).toBe( true );
	} );
} );
