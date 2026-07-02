type PlainObject = Record< string, unknown >;

const isPlainObject = ( value: unknown ): value is PlainObject => {
	if ( value === null || typeof value !== 'object' ) {
		return false;
	}
	const proto = Object.getPrototypeOf( value );
	return proto === null || proto === Object.prototype;
};

// Values lodash recurses into rather than assigning by reference: arrays and
// plain objects. Everything else (Dates, class instances, functions, typed
// arrays, …) is copied by reference.
const isMergeable = ( value: unknown ): boolean => Array.isArray( value ) || isPlainObject( value );

// Reads `constructor` as absent when it holds the built-in function, so a source
// `constructor` merges into a fresh own property instead of the real constructor
// (matching lodash). `__proto__` is skipped entirely in `baseMerge`.
const safeGet = ( object: PlainObject, key: string ): unknown => {
	if ( key === 'constructor' && typeof object[ key ] === 'function' ) {
		return undefined;
	}
	return object[ key ];
};

// Assigns like a sloppy-mode write. `Reflect.set` reports a rejected data-
// property write — a frozen or sealed object, a non-extensible object gaining a
// new key, or a non-writable property — as a `false` return rather than
// throwing, so the merge keeps going, matching lodash (which runs non-strict).
// Exceptions thrown by a userland setter still propagate, as they do in lodash.
// A plain strict-mode assignment would instead throw on the rejected write and
// abort the whole merge.
const assign = ( target: PlainObject, key: string, value: unknown ): void => {
	Reflect.set( target, key, value );
};

function baseMerge( target: PlainObject, source: PlainObject ): void {
	if ( target === source ) {
		return;
	}
	for ( const key of Object.keys( source ) ) {
		// Never read or write through `__proto__`; it can only reach a prototype.
		// Skipping outright also avoids writing an own `__proto__` key onto a
		// null-prototype target.
		if ( key === '__proto__' ) {
			continue;
		}
		const srcValue = safeGet( source, key );
		const objValue = safeGet( target, key );

		if ( isMergeable( srcValue ) ) {
			// Reuse a compatible destination container so nested objects merge in
			// place; otherwise start a fresh container to deep-copy into.
			let newValue: PlainObject | unknown[];
			if ( Array.isArray( srcValue ) ) {
				newValue = Array.isArray( objValue ) ? objValue : [];
			} else if ( objValue !== null && typeof objValue === 'object' ) {
				newValue = objValue as PlainObject;
			} else {
				newValue = {};
			}
			baseMerge( newValue as PlainObject, srcValue as PlainObject );
			// Skip the write when the container was reused (already in place).
			if ( newValue !== objValue ) {
				assign( target, key, newValue );
			}
		} else if ( srcValue !== undefined ) {
			assign( target, key, srcValue );
		} else if ( ! ( key in target ) ) {
			// A source `undefined` creates an absent key but never overwrites an
			// existing value.
			assign( target, key, undefined );
		}
	}
}

/**
 * Recursively merges own enumerable string-keyed properties of the source
 * objects into the destination object, mutating and returning it. Later sources
 * override earlier ones; arrays and plain objects are merged deeply while other
 * values are assigned by reference. Source properties resolving to `undefined`
 * are skipped when the destination already has the key. A source `__proto__`
 * key is ignored entirely and a `constructor` key is merged as a plain own
 * property, so neither can pollute a prototype.
 *
 * This targets plain JSON-like data and is intentionally narrower than lodash's
 * `merge`: it merges only own (not inherited) enumerable properties, treats
 * arrays as dense (sparse holes are not materialized), and does not special-case
 * typed arrays, buffers, or circular references.
 * @param object The destination object (mutated in place).
 * @param source The source object to merge in (additional sources are merged left to right).
 * @returns The mutated destination object.
 */
function merge< A, B >( object: A, source: B ): A & B;
function merge< A, B, C >( object: A, source1: B, source2: C ): A & B & C;
function merge< A, B, C, D >( object: A, source1: B, source2: C, source3: D ): A & B & C & D;
function merge( object: object, ...sources: unknown[] ): object;
function merge( object: object, ...sources: unknown[] ): object {
	for ( const source of sources ) {
		if ( source != null ) {
			baseMerge( object as PlainObject, source as PlainObject );
		}
	}
	return object;
}

export default merge;
