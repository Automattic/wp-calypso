import defaults from '../defaults';

describe( 'defaults', () => {
	it( 'fills only undefined destination properties', () => {
		expect( defaults( { a: 1 }, { a: 9, b: 2 } ) ).toEqual( { a: 1, b: 2 } );
	} );

	it( 'gives earlier sources precedence', () => {
		expect( defaults( {}, { a: 1 }, { a: 2, b: 3 } ) ).toEqual( { a: 1, b: 3 } );
	} );

	it( 'lets a later source fill a key whose earlier source value was undefined', () => {
		expect( defaults( {}, { a: undefined, b: 2 }, { a: 5 } ) ).toEqual( { a: 5, b: 2 } );
	} );

	it( 'skips nullish sources', () => {
		expect( defaults( { a: 1 }, null, undefined, { b: 2 } ) ).toEqual( { a: 1, b: 2 } );
	} );

	it( 'mutates and returns the destination object', () => {
		const target = { a: 1 };
		const result = defaults( target, { b: 2 } );
		expect( result ).toBe( target );
		expect( target ).toEqual( { a: 1, b: 2 } );
	} );

	it( 'coerces a nullish destination to a new object', () => {
		// @ts-expect-error -- exercises runtime tolerance of a nullish destination.
		expect( defaults( null, { a: 1 } ) ).toEqual( { a: 1 } );
		// @ts-expect-error -- see above.
		expect( defaults( undefined, { b: 2 } ) ).toEqual( { b: 2 } );
	} );

	it( 'copies inherited enumerable source properties', () => {
		const source = Object.create( { inherited: 9 } );
		source.own = 1;
		expect( defaults( {}, source ) ).toEqual( { own: 1, inherited: 9 } );
	} );

	it( 'fills keys that resolve through Object.prototype', () => {
		const result = defaults( {}, { constructor: 'x', toString: 'y', own: 1 } );
		expect( result.constructor ).toBe( 'x' );
		expect( result.toString ).toBe( 'y' );
		expect( result.own ).toBe( 1 );
	} );
} );
