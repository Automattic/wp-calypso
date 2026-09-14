import uniqBy from '../uniq-by';

describe( 'uniqBy', () => {
	it( 'should keep the first occurrence per `iteratee` result', () => {
		const array = [
			{ id: 1, label: 'a' },
			{ id: 2, label: 'b' },
			{ id: 1, label: 'c' },
		];

		expect( uniqBy( array, ( object ) => object.id ) ).toEqual( [
			{ id: 1, label: 'a' },
			{ id: 2, label: 'b' },
		] );
	} );

	it( 'should work with `_.property` shorthands', () => {
		const array = [ { dir: 'left' }, { dir: 'right' }, { dir: 'left' } ];

		expect( uniqBy( array, 'dir' ) ).toEqual( [ { dir: 'left' }, { dir: 'right' } ] );
	} );

	it( 'should work with a number for `iteratee`', () => {
		const array = [
			[ 1, 'a' ],
			[ 2, 'a' ],
			[ 1, 'b' ],
		];

		expect( uniqBy( array, 0 ) ).toEqual( [
			[ 1, 'a' ],
			[ 2, 'a' ],
		] );
	} );

	it( 'should treat duplicate `undefined` keys as equal', () => {
		const array = [ { id: undefined }, { id: undefined }, { id: 1 } ];

		expect( uniqBy( array, 'id' ) ).toEqual( [ { id: undefined }, { id: 1 } ] );
	} );

	it( 'should resolve the property shorthand off nullish elements without throwing', () => {
		const array = [ undefined, { avatar: 'a' }, undefined, { avatar: 'a' }, { avatar: 'b' } ];

		expect( uniqBy( array, 'avatar' ) ).toEqual( [ undefined, { avatar: 'a' }, { avatar: 'b' } ] );
	} );

	it( 'should return an empty array for a nullish collection', () => {
		expect( uniqBy( undefined as any, 'id' ) ).toEqual( [] );
	} );
} );
