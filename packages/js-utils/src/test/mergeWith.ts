import mergeWith from '../mergeWith';

type Customizer = (
	objValue: unknown,
	srcValue: unknown,
	key: string,
	object: object,
	source: object,
	stack: { size: number }
) => unknown;

// The customizer receives a `stack` whose `.size` reports the current recursion
// depth (used by `topLevelOnly` below and the depth test).
const overwriteArrays: Customizer = ( _objValue, srcValue ) =>
	Array.isArray( srcValue ) ? srcValue : undefined;

const concatArrays: Customizer = ( objValue, srcValue ) =>
	Array.isArray( objValue ) ? objValue.concat( srcValue ) : undefined;

const topLevelOnly: Customizer = ( _objValue, srcValue, key, _obj, _src, stack ) =>
	key === 'special' && stack.size === 0 ? 'REPLACED' : undefined;

const noop: Customizer = () => undefined;

describe( 'mergeWith', () => {
	// Each case is `[ label, customizer, makeInputs, expected ]`. `makeInputs` is a
	// factory so mergeWith gets fresh, mutable inputs; `expected` was captured from
	// the lodash function this replaces, so the table pins the behavior without
	// depending on lodash at run time.
	const cases: Array< [ string, Customizer, () => unknown[], unknown ] > = [
		[
			'noop customizer behaves like a deep merge',
			noop,
			() => [ { a: { b: 1 } }, { a: { c: 2 } } ],
			{ a: { b: 1, c: 2 } },
		],
		[
			'arrays overwrite instead of merging by index',
			overwriteArrays,
			() => [ { a: [ 1, 2, 3 ] }, { a: [ 9 ] } ],
			{ a: [ 9 ] },
		],
		[
			'nested arrays overwrite',
			overwriteArrays,
			() => [ { a: { list: [ 1, 2 ], n: 1 } }, { a: { list: [ 3 ], m: 2 } } ],
			{ a: { list: [ 3 ], n: 1, m: 2 } },
		],
		[
			'arrays concatenate',
			concatArrays,
			() => [ { a: [ 1, 2 ] }, { a: [ 3, 4 ] } ],
			{ a: [ 1, 2, 3, 4 ] },
		],
		[
			'concat creates a fresh array when destination lacks the key',
			concatArrays,
			() => [ {}, { a: [ 1, 2 ] } ],
			{ a: [ 1, 2 ] },
		],
		[
			'top-level key replaced, nested key of same name untouched',
			topLevelOnly,
			() => [
				{ special: 1, nested: { special: 2 } },
				{ special: 9, nested: { special: 9 } },
			],
			{ special: 'REPLACED', nested: { special: 9 } },
		],
		[
			'customizer undefined falls back to default for primitives',
			overwriteArrays,
			() => [ { a: 1 }, { a: 2 } ],
			{ a: 2 },
		],
		[
			'multiple sources merge left to right',
			overwriteArrays,
			() => [ {}, { a: 1 }, { a: 2, b: 3 } ],
			{ a: 2, b: 3 },
		],
		[
			'null source is ignored',
			overwriteArrays,
			() => [ { a: 1 }, null, { b: 2 } ],
			{ a: 1, b: 2 },
		],
		[
			'undefined source is ignored',
			overwriteArrays,
			() => [ { a: 1 }, undefined, { b: 2 } ],
			{ a: 1, b: 2 },
		],
		[
			'undefined src value skips existing key',
			noop,
			() => [ { a: 1 }, { a: undefined } ],
			{ a: 1 },
		],
		[ 'null overrides object', noop, () => [ { a: { b: 1 } }, { a: null } ], { a: null } ],
		[
			'__proto__ payload is dropped',
			noop,
			() => [ {}, JSON.parse( '{ "__proto__": { "x": 1 }, "a": 1 }' ) ],
			{ a: 1 },
		],
	];

	it.each( cases )( 'produces the expected result: %s', ( _label, customizer, make, expected ) => {
		const mine = ( mergeWith as ( ...a: unknown[] ) => unknown )( ...make(), customizer );
		expect( mine ).toEqual( expected );
	} );

	it( 'passes stack.size reflecting recursion depth to the customizer', () => {
		const depths: number[] = [];
		mergeWith(
			{ a: { b: { c: 1 } } },
			{ a: { b: { c: 2 } } },
			( _o, _s, _k, _obj, _src, stack ) => {
				depths.push( stack.size );
				return undefined;
			}
		);
		// a → depth 0, a.b → depth 1, a.b.c → depth 2.
		expect( depths ).toEqual( [ 0, 1, 2 ] );
	} );

	it( 'supports circular sources without infinite recursion', () => {
		const make = () => {
			const circular: Record< string, unknown > = { a: 1 };
			circular.self = circular;
			return circular;
		};
		const mine = mergeWith( {}, make(), noop ) as Record< string, unknown >;
		expect( mine.a ).toBe( 1 );
		// The nested `self` is merged once into its own container, then short-
		// circuited on re-entry rather than looping forever.
		expect( ( mine.self as Record< string, unknown > ).a ).toBe( 1 );
		expect( ( mine.self as Record< string, unknown > ).self ).toBe( mine.self );
	} );

	it( 'does not pollute Object.prototype via __proto__', () => {
		mergeWith( {}, JSON.parse( '{ "__proto__": { "polluted": 1 } }' ), noop );
		expect( ( {} as Record< string, unknown > ).polluted ).toBeUndefined();
	} );

	it( 'merges into a null-prototype destination with a concat customizer', () => {
		const result = mergeWith(
			Object.create( null ),
			{ handlers: [ 1 ] },
			{ handlers: [ 2 ] },
			concatArrays
		) as Record< string, unknown >;
		expect( result.handlers ).toEqual( [ 1, 2 ] );
	} );

	it( 'mutates and returns the destination', () => {
		const target = { a: 1 };
		const result = mergeWith( target, { b: 2 }, noop );
		expect( result ).toBe( target );
		expect( target ).toEqual( { a: 1, b: 2 } );
	} );

	it( 'treats a non-function trailing argument as a source', () => {
		// No customizer given — the last object is merged, not dropped or called.
		const mine = mergeWith( { a: { x: 1 } }, { a: { y: 2 } }, { b: 3 } );
		expect( mine ).toEqual( { a: { x: 1, y: 2 }, b: 3 } );
	} );

	it( 'merges a single source with no customizer', () => {
		const mine = mergeWith( { a: [ 1, 2 ] }, { a: [ 9 ], b: 4 } );
		expect( mine ).toEqual( { a: [ 9, 2 ], b: 4 } );
	} );

	it( 'returns a fresh object when the destination is nullish', () => {
		// A null destination (e.g. an unknown post merged with local edits) must
		// yield the merged edits rather than throwing on the null read.
		const mine = mergeWith( null, { a: 1, b: [ 2 ] }, overwriteArrays );
		expect( mine ).toEqual( { a: 1, b: [ 2 ] } );
	} );

	it( 'treats a lone trailing function as a source, not a customizer', () => {
		// With no source preceding it, a function argument is merged for its own
		// enumerable properties rather than being called as a customizer.
		const makeFn = () => {
			const fn = () => undefined;
			( fn as unknown as Record< string, unknown > ).a = 1;
			return fn;
		};
		const mine = mergeWith( {}, makeFn() );
		expect( ( mine as Record< string, unknown > ).a ).toBe( 1 );
	} );
} );
