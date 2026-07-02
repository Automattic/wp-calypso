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

// Reads a property while refusing the keys that could reach a prototype, so a
// crafted source (e.g. `JSON.parse( '{ "__proto__": … }' )`) can't pollute
// `Object.prototype`. Mirrors lodash's `safeGet`.
const safeGet = ( object: PlainObject, key: string ): unknown => {
	if ( key === '__proto__' ) {
		return undefined;
	}
	if ( key === 'constructor' && typeof object[ key ] === 'function' ) {
		return undefined;
	}
	return object[ key ];
};

// Assigns like a sloppy-mode write: if the target rejects it — a frozen or
// sealed object, a non-extensible object gaining a new key, or a non-writable
// property — the write is silently dropped rather than throwing, matching
// lodash (which runs non-strict). A strict-mode ES module would otherwise throw
// and abort the whole merge.
const trySet = ( target: PlainObject, key: string, value: unknown ): void => {
	try {
		target[ key ] = value;
	} catch {
		// Target rejected the write — drop it, as lodash does, and keep merging.
	}
};

function baseMerge( target: PlainObject, source: PlainObject ): void {
	if ( target === source ) {
		return;
	}
	for ( const key of Object.keys( source ) ) {
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
				trySet( target, key, newValue );
			}
		} else if ( srcValue !== undefined ) {
			trySet( target, key, srcValue );
		} else if ( ! ( key in target ) ) {
			// A source `undefined` creates an absent key but never overwrites an
			// existing value.
			trySet( target, key, undefined );
		}
	}
}

/**
 * Recursively merges own enumerable string-keyed properties of the source
 * objects into the destination object, mutating and returning it. Later sources
 * override earlier ones; arrays and plain objects are merged deeply while other
 * values are assigned by reference. Source properties resolving to `undefined`
 * are skipped when the destination already has the key, and prototype-polluting
 * keys (`__proto__`, function `constructor`) are ignored.
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
