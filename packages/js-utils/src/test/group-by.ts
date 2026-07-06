import groupBy from '../group-by';

describe( 'groupBy', () => {
	it( 'groups array values by a function iteratee, preserving order', () => {
		expect( groupBy( [ 1, 2, 3, 4 ], ( n ) => ( n % 2 === 0 ? 'even' : 'odd' ) ) ).toStrictEqual( {
			odd: [ 1, 3 ],
			even: [ 2, 4 ],
		} );
	} );

	it( 'groups by a property name', () => {
		const a = { type: 'x', id: 1 };
		const b = { type: 'y', id: 2 };
		const c = { type: 'x', id: 3 };
		expect( groupBy( [ a, b, c ], 'type' ) ).toStrictEqual( { x: [ a, c ], y: [ b ] } );
	} );

	it( 'rejects deep property paths rather than grouping under `undefined`', () => {
		expect( () => groupBy( [ { parent: { ID: 1 } } ], 'parent.ID' ) ).toThrow( /deep paths/ );
	} );

	it( 'merges keys that collide once coerced to strings', () => {
		expect( groupBy( [ 1, '1', 2 ] ) ).toStrictEqual( { '1': [ 1, '1' ], '2': [ 2 ] } );
	} );

	it( 'groups by the value itself when no iteratee is given', () => {
		expect( groupBy( [ 'a', 'b', 'a', 'c', 'b' ] ) ).toStrictEqual( {
			a: [ 'a', 'a' ],
			b: [ 'b', 'b' ],
			c: [ 'c' ],
		} );
	} );

	it( 'accepts an object collection, grouping its values', () => {
		expect(
			groupBy( { one: 1, two: 2, three: 3 }, ( n ) => ( n > 1 ? 'big' : 'small' ) )
		).toStrictEqual( { small: [ 1 ], big: [ 2, 3 ] } );
	} );

	it( 'returns an empty object for a nullish collection', () => {
		expect( groupBy( null ) ).toStrictEqual( {} );
		expect( groupBy( undefined, ( v ) => v ) ).toStrictEqual( {} );
	} );

	it( 'reads existing properties of primitive values', () => {
		expect( groupBy( [ 'one', 'two', 'six' ], 'length' ) ).toStrictEqual( {
			'3': [ 'one', 'two', 'six' ],
		} );
	} );

	it( 'groups primitives under `undefined` for a missing property', () => {
		expect( groupBy( [ 1, 2 ], 'type' ) ).toStrictEqual( { undefined: [ 1, 2 ] } );
	} );

	it( 'tolerates nullish values with a property iteratee', () => {
		expect( groupBy( [ null, undefined, { id: 1 } ], 'id' ) ).toStrictEqual( {
			undefined: [ null, undefined ],
			'1': [ { id: 1 } ],
		} );
	} );

	it( 'groups an own `__proto__` key as data without polluting the prototype', () => {
		const result = groupBy( [ '__proto__', '__proto__' ] );
		expect( Object.getPrototypeOf( result ) ).toBe( Object.prototype );
		expect( Object.hasOwn( result, '__proto__' ) ).toBe( true );
		expect( result.__proto__ ).toStrictEqual( [ '__proto__', '__proto__' ] );
	} );
} );
