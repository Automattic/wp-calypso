import orderBy from '../order-by';

describe( 'orderBy', () => {
	const people = [
		{ name: 'Bob', age: 30 },
		{ name: 'alice', age: 25 },
		{ name: 'carol', age: 40 },
	];

	it( 'sorts descending by a function iteratee', () => {
		expect( orderBy( people, ( p ) => p.age, [ 'desc' ] ).map( ( p ) => p.age ) ).toEqual( [
			40, 30, 25,
		] );
	} );

	it( 'accepts a single order string', () => {
		expect( orderBy( people, 'age', 'desc' ).map( ( p ) => p.age ) ).toEqual( [ 40, 30, 25 ] );
	} );

	it( 'sorts by multiple keys with mixed orders', () => {
		const data = [
			{ a: 'x', b: 1 },
			{ a: 'x', b: 2 },
			{ a: 'y', b: 5 },
		];
		expect( orderBy( data, [ 'a', 'b' ], [ 'asc', 'desc' ] ) ).toEqual( [
			{ a: 'x', b: 2 },
			{ a: 'x', b: 1 },
			{ a: 'y', b: 5 },
		] );
	} );

	it( 'defaults missing orders to ascending', () => {
		const data = [
			{ a: 'y', b: 1 },
			{ a: 'x', b: 2 },
			{ a: 'x', b: 1 },
		];
		expect( orderBy( data, [ 'a', 'b' ], [ 'desc' ] ) ).toEqual( [
			{ a: 'y', b: 1 },
			{ a: 'x', b: 1 },
			{ a: 'x', b: 2 },
		] );
	} );

	it( 'sorts the values of a plain object', () => {
		expect(
			orderBy( { a: { id: 1 }, b: { id: 3 }, c: { id: 2 } }, [ 'id' ], [ 'desc' ] ).map(
				( s ) => s.id
			)
		).toEqual( [ 3, 2, 1 ] );
	} );

	it( 'sorts by a path-array iteratee', () => {
		const data = [ { a: { b: 3 } }, { a: { b: 1 } }, { a: { b: 2 } } ];
		expect( orderBy( data, [ [ 'a', 'b' ] ], [ 'desc' ] ) ).toEqual( [
			{ a: { b: 3 } },
			{ a: { b: 2 } },
			{ a: { b: 1 } },
		] );
	} );

	it( 'treats a nullish iteratee as identity sorting', () => {
		expect( orderBy( [ 1, 2, 3 ], null, 'desc' ) ).toEqual( [ 3, 2, 1 ] );
	} );
} );
