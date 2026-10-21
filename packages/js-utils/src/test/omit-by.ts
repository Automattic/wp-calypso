import omitBy from '../omit-by';

describe( 'omitBy', () => {
	it( 'drops entries for which the predicate is truthy, passing value and key', () => {
		expect(
			omitBy( { a: 1, b: 2, c: 3 }, ( value, key ) => key === 'b' || value > 2 )
		).toStrictEqual( { a: 1 } );
	} );

	it( 'drops truthy values by default (keeps falsy)', () => {
		expect( omitBy( { a: 0, b: 1, c: '', d: 'x' } ) ).toStrictEqual( { a: 0, c: '' } );
	} );

	it( 'returns a shallow copy without mutating the source', () => {
		const nested = { x: 1 };
		const source = { keep: nested, drop: 1 };
		const result = omitBy( source, ( value ) => value === 1 );
		expect( source ).toStrictEqual( { keep: nested, drop: 1 } );
		expect( result.keep ).toBe( nested );
	} );

	it( 'returns an empty object for a nullish source', () => {
		const nullable: Record< string, number > | null | undefined = null;
		expect( omitBy( nullable ) ).toStrictEqual( {} );
	} );

	it( 'keeps an own `__proto__` key as data without polluting the prototype', () => {
		const input = JSON.parse( '{ "__proto__": { "polluted": true }, "a": 1 }' );
		const result = omitBy( input, () => false );
		expect( Object.getPrototypeOf( result ) ).toBe( Object.prototype );
		expect( Object.hasOwn( result, '__proto__' ) ).toBe( true );
	} );
} );
