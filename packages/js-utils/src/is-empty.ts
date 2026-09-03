import getTag from './get-tag';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const objectProto = Object.prototype;

// The tags treated as callable. Matching against the tag (rather than
// `typeof`) excludes a frozen object whose spoofed `Symbol.toStringTag` can't
// be unmasked from the array-like branch — the array-like gate is
// `!isFunction`, and the function check is tag-based.
const FUNCTION_TAGS = new Set( [
	'[object Function]',
	'[object GeneratorFunction]',
	'[object AsyncFunction]',
	'[object Proxy]',
] );

// A valid array-like length is a non-negative integer no greater than the
// maximum safe integer.
const isLength = ( value: unknown ): value is number =>
	typeof value === 'number' && value > -1 && value % 1 === 0 && value <= Number.MAX_SAFE_INTEGER;

// Whether the value is the `prototype` object of its own constructor (or
// `Object.prototype`).
const isPrototype = ( value: unknown ): boolean => {
	const Ctor = ( value as { constructor?: unknown } ).constructor;
	const proto =
		( typeof Ctor === 'function' && ( Ctor as { prototype?: unknown } ).prototype ) || objectProto;
	return value === proto;
};

/**
 * Checks whether a value is an empty object, collection, map, or set.
 *
 * A value is empty when it is `null`/`undefined`; an array, string, typed array,
 * `arguments`, or jQuery-like array-like (`splice` + valid `length`) with a
 * `length` of 0; a `Map`/`Set` with a `size` of 0; or any other value with no
 * own enumerable string-keyed properties — which
 * includes primitives such as numbers and booleans, and built-ins like `Date`
 * or `RegExp`. A plain object is empty only when it has no own keys, so
 * `{ length: 0 }` is *not* empty (it owns a `length` key).
 * @param value The value to check.
 * @returns `true` if the value is empty, otherwise `false`.
 */
const isEmpty = ( value: unknown ): boolean => {
	if ( value == null ) {
		return true;
	}

	// Tag-based checks (rather than `instanceof`) so the helper stays correct for
	// values created in another realm — e.g. a `Map` from an iframe or `vm`
	// context, whose `instanceof Map` is `false` against this realm's `Map`.
	// `getTag` reads the *raw* tag so a spoofed `Symbol.toStringTag` can't make a
	// plain object masquerade as a `Map`/`Set`.
	const tag = getTag( value );

	// Array-like values measured by `length`: arrays, strings, typed arrays (and
	// Node buffers, which subclass `Uint8Array`), `arguments`, and jQuery-like
	// collections (an object with a `splice` method). This whole branch is gated
	// behind an array-like check — a valid `length` on a non-function — so a bare
	// object that merely owns a `length`, a function (whose `length` is its
	// arity), or an `arguments`/spoofed value whose `length` has been removed,
	// falls through to the own-key check below.
	const length = ( value as { length?: unknown } ).length;
	if (
		isLength( length ) &&
		! FUNCTION_TAGS.has( tag ) &&
		( Array.isArray( value ) ||
			typeof value === 'string' ||
			( ArrayBuffer.isView( value ) && tag !== '[object DataView]' ) ||
			// The `arguments` check is gated by an object-like test, so a function
			// spoofing an `Arguments` tag is not measured by its arity.
			( typeof value === 'object' && tag === '[object Arguments]' ) ||
			( typeof value === 'object' &&
				typeof ( value as { splice?: unknown } ).splice === 'function' ) )
	) {
		return length === 0;
	}

	if ( tag === '[object Map]' || tag === '[object Set]' ) {
		// `! size` (not `size === 0`) handles a frozen object whose spoofed
		// `Symbol.toStringTag` can't be unmasked and so has no `size`.
		return ! ( value as Map< unknown, unknown > | Set< unknown > ).size;
	}

	// Everything else (plain objects, class instances, and primitives) is empty
	// when it has no own enumerable string-keyed properties. `for…in` skips
	// symbol keys. For a prototype object the own `constructor` key is
	// ignored, so `Foo.prototype = { constructor: Foo }` is empty.
	const skipConstructor = isPrototype( value );
	for ( const key in value as object ) {
		if ( hasOwnProperty.call( value, key ) && ! ( skipConstructor && key === 'constructor' ) ) {
			return false;
		}
	}
	return true;
};

export default isEmpty;
