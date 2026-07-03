import sortBy from '../sort-by';

describe( 'sortBy', () => {
	const people = [
		{ name: 'Bob', age: 30 },
		{ name: 'alice', age: 25 },
		{ name: 'carol', age: 40 },
	];

	it( 'sorts by a function iteratee', () => {
		expect( sortBy( people, ( p ) => p.age ).map( ( p ) => p.age ) ).toEqual( [ 25, 30, 40 ] );
	} );

	it( 'sorts by a property name', () => {
		// Capitalized "Bob" sorts before lowercase names.
		expect( sortBy( people, 'name' ).map( ( p ) => p.name ) ).toEqual( [
			'Bob',
			'alice',
			'carol',
		] );
	} );

	it( 'sorts by multiple property names', () => {
		const data = [
			{ a: 'x', b: 2 },
			{ a: 'x', b: 1 },
			{ a: 'y', b: 0 },
		];
		expect( sortBy( data, [ 'a', 'b' ] ) ).toEqual( [
			{ a: 'x', b: 1 },
			{ a: 'x', b: 2 },
			{ a: 'y', b: 0 },
		] );
	} );

	it( 'sorts by numeric index iteratees', () => {
		expect(
			sortBy(
				[
					[ 1, 2 ],
					[ 1, 1 ],
					[ 0, 9 ],
				],
				[ 0, 1 ]
			)
		).toEqual( [
			[ 0, 9 ],
			[ 1, 1 ],
			[ 1, 2 ],
		] );
	} );

	it( 'sorts by a dotted property path', () => {
		expect( sortBy( [ { a: { b: 3 } }, { a: { b: 1 } }, { a: { b: 2 } } ], 'a.b' ) ).toEqual( [
			{ a: { b: 1 } },
			{ a: { b: 2 } },
			{ a: { b: 3 } },
		] );
	} );

	it( 'sorts primitives by identity when no iteratee is given', () => {
		expect( sortBy( [ 3, 1, 2 ] ) ).toEqual( [ 1, 2, 3 ] );
	} );

	it( 'sorts the values of a plain object', () => {
		expect( sortBy( { x: { v: 3 }, y: { v: 1 }, z: { v: 2 } }, 'v' ) ).toEqual( [
			{ v: 1 },
			{ v: 2 },
			{ v: 3 },
		] );
	} );

	it( 'sorts undefined criteria last', () => {
		expect( sortBy( [ { v: 2 }, { v: undefined }, { v: 1 } ], 'v' ) ).toEqual( [
			{ v: 1 },
			{ v: 2 },
			{ v: undefined },
		] );
	} );

	it( 'is stable for equal criteria', () => {
		const data = [
			{ k: 1, id: 'a' },
			{ k: 1, id: 'b' },
			{ k: 0, id: 'c' },
		];
		expect( sortBy( data, 'k' ).map( ( d ) => d.id ) ).toEqual( [ 'c', 'a', 'b' ] );
	} );

	it( 'returns an empty array for a nullish collection', () => {
		expect( sortBy( null, 'x' ) ).toEqual( [] );
	} );

	it( 'accepts variadic iteratees', () => {
		const data = [
			{ a: 'x', b: 2 },
			{ a: 'x', b: 1 },
			{ a: 'y', b: 0 },
		];
		expect( sortBy( data, 'a', 'b' ) ).toEqual( [
			{ a: 'x', b: 1 },
			{ a: 'x', b: 2 },
			{ a: 'y', b: 0 },
		] );
	} );

	it( 'sorts by a bracket-notation path', () => {
		expect( sortBy( [ { a: [ 3 ] }, { a: [ 1 ] }, { a: [ 2 ] } ], 'a[0]' ) ).toEqual( [
			{ a: [ 1 ] },
			{ a: [ 2 ] },
			{ a: [ 3 ] },
		] );
	} );

	it( 'treats a literal key containing dots as a whole key', () => {
		expect( sortBy( [ { 'key.with.dot': 2 }, { 'key.with.dot': 1 } ], 'key.with.dot' ) ).toEqual( [
			{ 'key.with.dot': 1 },
			{ 'key.with.dot': 2 },
		] );
	} );

	it( 'sorts by an empty-string key', () => {
		expect( sortBy( [ { '': 2 }, { '': 1 } ], '' ) ).toEqual( [ { '': 1 }, { '': 2 } ] );
	} );

	it( 'treats a nullish iteratee as identity sorting', () => {
		// @ts-expect-error -- null iteratee sorts by identity.
		expect( sortBy( [ 2, 1, 3 ], null ) ).toEqual( [ 1, 2, 3 ] );
		expect( sortBy( [ 2, 1, 3 ], undefined ) ).toEqual( [ 1, 2, 3 ] );
	} );

	it( 'materializes sparse-array holes as undefined', () => {
		// eslint-disable-next-line no-sparse-arrays
		expect( sortBy( [ , 1, , 0 ] ) ).toEqual( [ 0, 1, undefined, undefined ] );
	} );

	it( 'flattens iteratee arguments one level', () => {
		const data = [
			{ a: 1, b: 1, c: 3 },
			{ a: 1, b: 1, c: 1 },
			{ a: 1, b: 0, c: 9 },
		];
		// `[ 'a', 'b' ], 'c'` means sort by a, then b, then c.
		expect( sortBy( data, [ 'a', 'b' ], 'c' ) ).toEqual( [
			{ a: 1, b: 0, c: 9 },
			{ a: 1, b: 1, c: 1 },
			{ a: 1, b: 1, c: 3 },
		] );
	} );
} );
