import { runInNewContext } from 'vm';
import isEmpty from '../is-empty';

describe( 'isEmpty', () => {
	it( 'treats null and undefined as empty', () => {
		expect( isEmpty( null ) ).toBe( true );
		expect( isEmpty( undefined ) ).toBe( true );
	} );

	it( 'measures strings by length', () => {
		expect( isEmpty( '' ) ).toBe( true );
		expect( isEmpty( 'a' ) ).toBe( false );
	} );

	it( 'measures arrays by length', () => {
		expect( isEmpty( [] ) ).toBe( true );
		expect( isEmpty( [ 1 ] ) ).toBe( false );
	} );

	it( 'measures plain objects by own enumerable keys', () => {
		expect( isEmpty( {} ) ).toBe( true );
		expect( isEmpty( { a: 1 } ) ).toBe( false );
	} );

	it( 'treats a plain object that merely owns a length as non-empty', () => {
		expect( isEmpty( { length: 0 } ) ).toBe( false );
		expect( isEmpty( { length: 5 } ) ).toBe( false );
	} );

	it( 'ignores inherited (non-own) properties', () => {
		expect( isEmpty( Object.create( { a: 1 } ) ) ).toBe( true );
	} );

	it( 'measures Map and Set by size', () => {
		expect( isEmpty( new Map() ) ).toBe( true );
		expect( isEmpty( new Map( [ [ 1, 2 ] ] ) ) ).toBe( false );
		expect( isEmpty( new Set() ) ).toBe( true );
		expect( isEmpty( new Set( [ 1 ] ) ) ).toBe( false );
	} );

	it( 'measures typed arrays by length', () => {
		expect( isEmpty( new Uint8Array( 0 ) ) ).toBe( true );
		expect( isEmpty( new Uint8Array( 3 ) ) ).toBe( false );
	} );

	it( 'treats primitives as empty (they have no own enumerable keys)', () => {
		expect( isEmpty( 0 ) ).toBe( true );
		expect( isEmpty( 1 ) ).toBe( true );
		expect( isEmpty( NaN ) ).toBe( true );
		expect( isEmpty( true ) ).toBe( true );
		expect( isEmpty( false ) ).toBe( true );
		expect( isEmpty( Symbol( 'x' ) ) ).toBe( true );
	} );

	it( 'treats key-less built-ins and functions as empty', () => {
		expect( isEmpty( /ab/ ) ).toBe( true );
		expect( isEmpty( new Date() ) ).toBe( true );
		expect( isEmpty( () => {} ) ).toBe( true );
	} );

	it( 'measures jQuery-like array-likes (splice method + valid length) by length', () => {
		expect( isEmpty( { length: 0, splice() {} } ) ).toBe( true );
		expect( isEmpty( { length: 2, splice() {} } ) ).toBe( false );
	} );

	it( 'does not treat splice-or-length-only objects as array-like', () => {
		expect( isEmpty( { splice() {} } ) ).toBe( false );
		expect( isEmpty( { length: -1, splice() {} } ) ).toBe( false );
		expect( isEmpty( { length: 1.5, splice() {} } ) ).toBe( false );
	} );

	it( 'treats a bare prototype object as empty (ignores own constructor key)', () => {
		function Bar() {}
		Bar.prototype = { constructor: Bar };
		expect( isEmpty( Bar.prototype ) ).toBe( true );
		expect( isEmpty( Object.prototype ) ).toBe( true );

		function Baz() {}
		Baz.prototype = { constructor: Baz, x: 1 };
		expect( isEmpty( Baz.prototype ) ).toBe( false );

		// A plain object that merely owns a `constructor` key is not a prototype.
		expect( isEmpty( { constructor() {} } ) ).toBe( false );
	} );

	it( 'ignores a spoofed Symbol.toStringTag', () => {
		// A plain object masquerading as a Map is measured by its own keys, not size.
		expect( isEmpty( { [ Symbol.toStringTag ]: 'Map', size: 0, a: 1 } ) ).toBe( false );
		expect( isEmpty( { [ Symbol.toStringTag ]: 'Map' } ) ).toBe( true );
	} );

	it( 'handles a frozen object with an un-unmaskable spoofed tag', () => {
		// Frozen, so the spoofed tag can't be cleared: the Map branch sees no
		// `size`, and `! undefined` is `true`, not `0 === …`.
		expect( isEmpty( Object.freeze( { [ Symbol.toStringTag ]: 'Map' } ) ) ).toBe( true );
	} );

	it( 'measures Map and Set created in another realm (tag-based, not instanceof)', () => {
		const emptyMap = runInNewContext( 'new Map()' );
		const filledMap = runInNewContext( 'new Map( [ [ 1, 2 ] ] )' );
		const emptySet = runInNewContext( 'new Set()' );
		const filledSet = runInNewContext( 'new Set( [ 1 ] )' );
		expect( isEmpty( emptyMap ) ).toBe( true );
		expect( isEmpty( filledMap ) ).toBe( false );
		expect( isEmpty( emptySet ) ).toBe( true );
		expect( isEmpty( filledSet ) ).toBe( false );
	} );

	it( 'measures an arguments object by length', () => {
		/* eslint-disable prefer-rest-params -- exercising the `arguments`-object branch */
		const empty = ( function () {
			return arguments;
		} )();
		const filled = ( function () {
			return arguments;
		} )( 1, 2 );
		/* eslint-enable prefer-rest-params */
		expect( isEmpty( empty ) ).toBe( true );
		expect( isEmpty( filled ) ).toBe( false );
	} );

	describe( 'across a table of representative values', () => {
		function Bar() {}
		Bar.prototype = { constructor: Bar };
		function Baz() {}
		Baz.prototype = { constructor: Baz, x: 1 };

		/* eslint-disable prefer-rest-params -- exercising the `arguments`-object branch */
		const emptyArgs = ( function () {
			return arguments;
		} )();
		const filledArgs = ( function () {
			return arguments;
		} )( 1, 2 );
		const lengthlessArgs = ( function () {
			return arguments;
		} )();
		/* eslint-enable prefer-rest-params */
		delete ( lengthlessArgs as { length?: unknown } ).length;

		// A function is never treated as array-like (its `length` is arity), so it
		// is measured by own keys. Only a function whose spoofed `Arguments` tag
		// can't be unmasked (frozen) would otherwise reach the length branch.
		const spliceFn = Object.assign( function () {}, { splice() {} } );
		const taggedFn = function () {};
		( taggedFn as Record< symbol, unknown > )[ Symbol.toStringTag ] = 'Arguments';
		( taggedFn as { key?: number } ).key = 1;
		Object.freeze( taggedFn );

		// A frozen object spoofing a function-family tag: the `isArrayLike` check
		// excludes it (tag-based `isFunction`), so it is measured by own keys, not
		// its `length`. Each is non-empty (owns `length`/`splice`).
		const functionTagSpoofs = [ 'Function', 'AsyncFunction', 'GeneratorFunction', 'Proxy' ].map(
			( tag ): [ string, unknown, boolean ] => [
				`frozen splice object tagged ${ tag }`,
				Object.freeze( { length: 0, splice() {}, [ Symbol.toStringTag ]: tag } ),
				false,
			]
		);

		// Each row is `[ label, value, expected ]`. The expected results were
		// captured from the lodash function this replaces, so the table pins the
		// behavior without depending on lodash at run time.
		const cases: [ string, unknown, boolean ][] = [
			[ 'null', null, true ],
			[ 'undefined', undefined, true ],
			[ 'empty string', '', true ],
			[ 'string', 'a', false ],
			[ 'empty array', [], true ],
			[ 'array', [ 1 ], false ],
			[ 'empty object', {}, true ],
			[ 'object', { a: 1 }, false ],
			[ 'object with length key', { length: 0 }, false ],
			[ 'zero', 0, true ],
			[ 'number', 1, true ],
			[ 'NaN', NaN, true ],
			[ 'true', true, true ],
			[ 'false', false, true ],
			[ 'symbol', Symbol( 'x' ), true ],
			[ 'empty Map', new Map(), true ],
			[ 'Map', new Map( [ [ 1, 2 ] ] ), false ],
			[ 'empty Set', new Set(), true ],
			[ 'Set', new Set( [ 1 ] ), false ],
			[ 'empty typed array', new Uint8Array( 0 ), true ],
			[ 'typed array', new Uint8Array( 2 ), false ],
			[ 'DataView', new DataView( new ArrayBuffer( 8 ) ), true ],
			[ 'function', () => {}, true ],
			[ 'regexp', /re/, true ],
			[ 'date', new Date(), true ],
			[ 'null-proto object', Object.create( null ), true ],
			[ 'inherited-only object', Object.create( { a: 1 } ), true ],
			[ 'empty jQuery-like', { length: 0, splice() {} }, true ],
			[ 'jQuery-like', { length: 2, splice() {} }, false ],
			[ 'splice without length', { splice() {} }, false ],
			[ 'spoofed toStringTag with keys', { [ Symbol.toStringTag ]: 'Map', size: 0, a: 1 }, false ],
			[ 'spoofed toStringTag only', { [ Symbol.toStringTag ]: 'Map' }, true ],
			[ 'frozen spoofed toStringTag', Object.freeze( { [ Symbol.toStringTag ]: 'Map' } ), true ],
			[ 'bare prototype object', Bar.prototype, true ],
			[ 'Object.prototype', Object.prototype, true ],
			[ 'prototype with extra key', Baz.prototype, false ],
			[ 'empty arguments', emptyArgs, true ],
			[ 'filled arguments', filledArgs, false ],
			[ 'arguments with length deleted', lengthlessArgs, true ],
			[
				'frozen spoofed Arguments tag',
				Object.freeze( { [ Symbol.toStringTag ]: 'Arguments' } ),
				true,
			],
			[ 'function with own splice', spliceFn, false ],
			[ 'frozen function spoofing Arguments with own key', taggedFn, false ],
			...functionTagSpoofs,
		];

		it.each( cases )( 'returns the expected result for %s', ( _label, value, expected ) => {
			expect( isEmpty( value ) ).toBe( expected );
		} );
	} );
} );
