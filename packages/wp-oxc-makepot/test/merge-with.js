const mergeWith = require( '../utils/merge-with' );

describe( 'mergeWith', () => {
	afterEach( () => {
		delete Object.prototype.polluted;
	} );

	const lastWins = ( left, right ) => ( right === undefined ? left : right );

	it( 'assigns the customizer result for each source key and mutates the destination', () => {
		const target = { a: 1, b: 2 };
		const result = mergeWith( target, { b: 3, c: 4 }, lastWins );

		expect( result ).toBe( target );
		expect( result ).toEqual( { a: 1, b: 3, c: 4 } );
	} );

	it( 'passes ( destValue, srcValue, key ) to the customizer', () => {
		const calls = [];
		mergeWith( { a: 1 }, { a: 2, b: 3 }, ( left, right, key ) => {
			calls.push( [ left, right, key ] );
			return right;
		} );

		expect( calls ).toEqual( [
			[ 1, 2, 'a' ],
			[ undefined, 3, 'b' ],
		] );
	} );

	it( 'skips a source __proto__ key without polluting Object.prototype', () => {
		// JSON.parse creates an own enumerable `__proto__` key; an object literal would not.
		const source = JSON.parse( '{ "__proto__": { "polluted": true }, "safe": 1 }' );
		const result = mergeWith( {}, source, ( left, right ) => right );

		expect( {}.polluted ).toBeUndefined();
		expect( Object.keys( result ) ).toEqual( [ 'safe' ] );
	} );
} );
