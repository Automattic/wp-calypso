import {
	assign,
	isMergeable,
	pickMergeContainer,
	safeGet,
	type PlainObject,
} from './merge-internal';

// This is kept as its own traversal rather than sharing one engine with
// `mergeWith`: `merge` intentionally does not track a stack, so a circular
// source stack-overflows (its documented, tested contract) while `mergeWith`
// terminates on cycles. Unifying them would silently give `merge` that support.
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
			const newValue = pickMergeContainer( objValue, srcValue );
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
 * This targets plain JSON-like data and is intentionally narrow: it merges only
 * own (not inherited) enumerable properties, treats arrays as dense (sparse
 * holes are not materialized), and does not special-case typed arrays, buffers,
 * or circular references.
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
