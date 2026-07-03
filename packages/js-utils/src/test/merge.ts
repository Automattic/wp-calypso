// eslint-disable-next-line no-restricted-imports -- parity test against the lodash function being replaced
import lodashMerge from 'lodash/merge';
import merge from '../merge';

describe( 'merge', () => {
	// Each case is a factory so the two implementations get independent inputs
	// (both mutate their destination).
	const cases: Array< [ string, () => unknown[] ] > = [
		[ 'shallow object merge', () => [ { a: 1 }, { b: 2 } ] ],
		[ 'overrides earlier keys', () => [ { a: 1 }, { a: 2 } ] ],
		[ 'deep nested objects', () => [ { a: { b: { c: 1 } } }, { a: { b: { d: 2 } } } ] ],
		[ 'multiple sources left to right', () => [ {}, { a: 1 }, { a: 2, b: 3 }, { b: 4 } ] ],
		[ 'fresh target does not mutate later sources', () => [ {}, { a: { b: 1 } } ] ],
		[ 'arrays merge by index', () => [ { a: [ 1, 2, 3 ] }, { a: [ 9 ] } ] ],
		[ 'longer source array', () => [ { a: [ 1 ] }, { a: [ 9, 8, 7 ] } ] ],
		[ 'array of objects merges element-wise', () => [ { a: [ { x: 1 } ] }, { a: [ { y: 2 } ] } ] ],
		[ 'undefined source skips existing key', () => [ { a: 1 }, { a: undefined } ] ],
		[ 'undefined source creates absent key', () => [ {}, { a: undefined } ] ],
		[ 'null overrides', () => [ { a: { b: 1 } }, { a: null } ] ],
		[ 'null destination replaced by object', () => [ { a: null }, { a: { b: 1 } } ] ],
		[ 'primitive destination replaced by object', () => [ { a: 5 }, { a: { b: 1 } } ] ],
		[ 'object destination replaced by primitive', () => [ { a: { b: 1 } }, { a: 5 } ] ],
		[ 'array destination, object source', () => [ { a: [ 1, 2 ] }, { a: { 0: 9 } } ] ],
		[
			'zero and false and empty string',
			() => [
				{ a: 1, b: 1, c: 1 },
				{ a: 0, b: false, c: '' },
			],
		],
		[ 'nested mixed', () => [ { a: { list: [ 1 ], n: 2 } }, { a: { list: [ 3, 4 ], m: 5 } } ] ],
		[ 'null source is ignored', () => [ { a: 1 }, null, { b: 2 } ] ],
		[ 'undefined source is ignored', () => [ { a: 1 }, undefined, { b: 2 } ] ],
		[ 'empty sources', () => [ { a: 1 } ] ],
		[ '__proto__ payload is dropped', () => [ {}, JSON.parse( '{ "__proto__": { "x": 1 } }' ) ] ],
		[
			'constructor payload merges as own key',
			() => [ {}, JSON.parse( '{ "constructor": { "prototype": { "x": 1 } } }' ) ],
		],
		[
			'mixed __proto__ payload',
			() => [ {}, JSON.parse( '{ "a": 1, "__proto__": { "x": 1 } }' ) ],
		],
		[ 'sealed target drops new keys', () => [ Object.seal( { a: 1 } ), { a: 2, b: 3 } ] ],
		[
			'non-writable property is skipped',
			() => [
				Object.defineProperty( {}, 'a', {
					value: 1,
					writable: false,
					enumerable: true,
					configurable: true,
				} ),
				{ a: 2, b: 3 },
			],
		],
	];

	it.each( cases )( 'matches the reference implementation: %s', ( _label, make ) => {
		const mineArgs = make() as [ Record< string, unknown >, ...unknown[] ];
		const theirsArgs = make() as [ Record< string, unknown >, ...unknown[] ];
		const mine = ( merge as ( ...a: unknown[] ) => unknown )( ...mineArgs );
		const theirs = lodashMerge( ...( theirsArgs as [ object, ...unknown[] ] ) );
		expect( mine ).toEqual( theirs );
	} );

	it( 'does not pollute Object.prototype via __proto__ or constructor', () => {
		merge( {}, JSON.parse( '{ "__proto__": { "polluted": 1 } }' ) );
		merge( {}, JSON.parse( '{ "constructor": { "prototype": { "polluted2": 1 } } }' ) );
		const probe = {} as Record< string, unknown >;
		expect( probe.polluted ).toBeUndefined();
		expect( probe.polluted2 ).toBeUndefined();
	} );

	it( 'ignores a __proto__ source key even for a null-prototype target', () => {
		// A null-prototype target has no inherited `__proto__`, so a naive
		// implementation would write an own `__proto__` key. It must not.
		const target = Object.create( null ) as Record< string, unknown >;
		const result = merge( target, JSON.parse( '{ "__proto__": { "x": 1 }, "a": 1 }' ) );
		expect( Object.getPrototypeOf( result ) ).toBeNull();
		expect( Object.prototype.hasOwnProperty.call( result, '__proto__' ) ).toBe( false );
		expect( result.a ).toBe( 1 );
	} );

	it( 'merges only own enumerable source properties, not inherited ones', () => {
		// Intentionally narrower: inherited enumerable properties are not copied
		// (a `for…in` traversal would include them).
		const source = Object.create( { inherited: 1 } ) as Record< string, unknown >;
		source.own = 2;
		expect( merge( {}, source ) ).toEqual( { own: 2 } );
	} );

	it( 'treats arrays as dense — sparse holes are not materialized', () => {
		// Intentionally narrower: the sparse hole is not filled (index 1 is
		// not materialized as `null` in the result).
		const sparse: number[] = [ 1 ];
		sparse[ 2 ] = 3; // leaves a hole at index 1
		const result = merge( {} as { a?: unknown[] }, { a: sparse } );
		expect( result.a?.[ 0 ] ).toBe( 1 );
		expect( result.a?.[ 2 ] ).toBe( 3 );
		expect( 1 in ( result.a as unknown[] ) ).toBe( false );
	} );

	it( 'throws on a circular source (circular references are unsupported)', () => {
		const circular: Record< string, unknown > = {};
		circular.self = circular;
		expect( () => merge( {}, circular ) ).toThrow();
	} );

	it( 'propagates exceptions from a throwing setter', () => {
		const makeTarget = () =>
			Object.defineProperty( {}, 'x', {
				set() {
					throw new Error( 'setter boom' );
				},
				enumerable: true,
				configurable: true,
			} );
		expect( () => merge( makeTarget() as Record< string, unknown >, { x: 1 } ) ).toThrow(
			'setter boom'
		);
		expect( () => lodashMerge( makeTarget(), { x: 1 } ) ).toThrow( 'setter boom' );
	} );

	it( 'assigns Date and class instances by reference (does not deep-clone)', () => {
		class Widget {
			value = 1;
		}
		const widget = new Widget();
		const date = new Date( 0 );
		const result = merge( {} as { d?: Date; w?: Widget }, { d: date, w: widget } );
		expect( result.d ).toBe( date );
		expect( result.w ).toBe( widget );
		expect( result.w ).toBeInstanceOf( Widget );
	} );

	it( 'mutates and returns the destination', () => {
		const target = { a: 1 };
		const result = merge( target, { b: 2 } );
		expect( result ).toBe( target );
		expect( target ).toEqual( { a: 1, b: 2 } );
	} );

	it( 'does not mutate the source objects', () => {
		const source = { a: { b: 1 } };
		merge( {}, source );
		expect( source ).toEqual( { a: { b: 1 } } );
	} );

	it( 'silently ignores writes to a frozen target', () => {
		const frozen = Object.freeze( { a: { b: 1 } } );
		// Computing this at all proves the write does not throw under strict mode.
		const mine = merge( frozen, { meta: 1 } as Record< string, unknown > );
		const theirs = lodashMerge( Object.freeze( { a: { b: 1 } } ), { meta: 1 } );
		expect( mine ).toEqual( theirs );
		expect( mine ).toEqual( { a: { b: 1 } } );
	} );
} );
