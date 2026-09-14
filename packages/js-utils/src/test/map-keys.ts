import mapKeys from '../map-keys';

describe( 'mapKeys', () => {
	it( 'replaces each key with the iteratee result, passing value and key', () => {
		expect( mapKeys( { a: 1, b: 2 }, ( value, key ) => `${ key }${ value }` ) ).toStrictEqual( {
			a1: 1,
			b2: 2,
		} );
	} );

	it( 'keeps values by reference (shallow)', () => {
		const nested = { x: 1 };
		expect( mapKeys( { a: nested }, ( _value, key ) => key.toUpperCase() ).A ).toBe( nested );
	} );

	it( 'keeps the last value when the iteratee collides keys', () => {
		expect( mapKeys( { a: 1, b: 2 }, () => 'same' ) ).toStrictEqual( { same: 2 } );
	} );

	it( 'returns an empty object for a nullish source', () => {
		const nullable: Record< string, number > | null | undefined = null;
		expect( mapKeys( nullable, ( _value, key ) => key ) ).toStrictEqual( {} );
	} );

	it( 'produces an own `__proto__` key as data without polluting the prototype', () => {
		const result = mapKeys( { a: 1 }, () => '__proto__' );
		expect( Object.getPrototypeOf( result ) ).toBe( Object.prototype );
		expect( Object.hasOwn( result, '__proto__' ) ).toBe( true );
		expect( result.__proto__ ).toBe( 1 );
	} );
} );
