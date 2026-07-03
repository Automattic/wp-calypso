import {
	assign,
	isMergeable,
	pickMergeContainer,
	safeGet,
	type PlainObject,
} from './merge-internal';

/**
 * Called for every source key to optionally produce the merged value. Returning
 * `undefined` defers to the default merge for that key; any other return value
 * is used as-is (no further recursion). `stack` maps each source value being
 * merged to its destination container, so `stack.size` reflects the current
 * recursion depth — `0` at the top level.
 */
export type MergeWithCustomizer = (
	objValue: unknown,
	srcValue: unknown,
	key: string,
	object: PlainObject,
	source: PlainObject,
	stack: Map< unknown, unknown >
) => unknown;

// The customizer used when the caller omits one: defers every key to the
// default merge, so `mergeWith` degrades to a plain deep merge (like lodash).
const defaultCustomizer: MergeWithCustomizer = () => undefined;

// SameValueZero, matching lodash's `eq`: like `===` but treats two NaNs as
// equal. Used to skip writes that would not change the destination.
const eq = ( a: unknown, b: unknown ): boolean => a === b || ( a !== a && b !== b );

// Mirrors lodash's `assignMergeValue`: assign only when the value actually
// differs, and let a `undefined` value create an absent key without clobbering
// an existing one.
const assignMergeValue = ( target: PlainObject, key: string, value: unknown ): void => {
	if (
		( value !== undefined && ! eq( target[ key ], value ) ) ||
		( value === undefined && ! ( key in target ) )
	) {
		assign( target, key, value );
	}
};

function baseMergeDeep(
	target: PlainObject,
	source: PlainObject,
	key: string,
	srcValue: unknown,
	customizer: MergeWithCustomizer,
	stack: Map< unknown, unknown >
): void {
	const objValue = safeGet( target, key );

	// A source value already being merged upstream: reuse its destination
	// container instead of recursing again, so circular references terminate.
	const stacked = stack.get( srcValue );
	if ( stacked ) {
		assignMergeValue( target, key, stacked );
		return;
	}

	let newValue = customizer( objValue, srcValue, key, target, source, stack );

	// A customizer result other than `undefined` is used as-is. Otherwise deep-
	// merge into a compatible container. Every value reaching this branch is
	// mergeable (array or plain object), so unlike lodash there is no buffer or
	// typed-array case that would skip the recursion.
	if ( newValue === undefined ) {
		newValue = pickMergeContainer( objValue, srcValue );
		stack.set( srcValue, newValue );
		baseMergeWith( newValue as PlainObject, srcValue as PlainObject, customizer, stack );
		stack.delete( srcValue );
	}
	assignMergeValue( target, key, newValue );
}

function baseMergeWith(
	target: PlainObject,
	source: PlainObject,
	customizer: MergeWithCustomizer,
	stack: Map< unknown, unknown >
): void {
	if ( target === source ) {
		return;
	}
	for ( const key of Object.keys( source ) ) {
		// Never read or write through `__proto__`; it can only reach a prototype.
		if ( key === '__proto__' ) {
			continue;
		}
		const srcValue = safeGet( source, key );
		if ( isMergeable( srcValue ) ) {
			baseMergeDeep( target, source, key, srcValue, customizer, stack );
		} else {
			const objValue = safeGet( target, key );
			let newValue = customizer( objValue, srcValue, key, target, source, stack );
			if ( newValue === undefined ) {
				newValue = srcValue;
			}
			assignMergeValue( target, key, newValue );
		}
	}
}

/**
 * Like {@link ./merge merge}, but a `customizer` invoked for every source key
 * decides the merged value: it runs first and, when it returns anything other
 * than `undefined`, that result is assigned directly instead of the default
 * deep merge. As in lodash, the customizer is optional and identified as the
 * trailing argument only when it is a function AND at least one source precedes
 * it; otherwise every argument after the destination is treated as a source
 * (so a lone trailing function is merged as a source) and the merge runs without
 * a customizer. Sources are merged left to right.
 *
 * This shares merge's narrower-than-lodash scope: it merges only own enumerable
 * properties, treats arrays as dense, and does not special-case typed arrays or
 * buffers. Unlike merge, circular references are supported (each in-progress
 * source is tracked so it is merged once).
 * @param object The destination (mutated in place; a nullish value becomes a fresh object).
 * @param args Source objects, optionally followed by a customizer function.
 * @returns The mutated (or freshly created) destination object.
 */
function mergeWith( object: object | null | undefined, ...args: unknown[] ): object {
	const last = args[ args.length - 1 ];
	const hasCustomizer = args.length > 1 && typeof last === 'function';
	const customizer = hasCustomizer ? ( last as MergeWithCustomizer ) : defaultCustomizer;
	const sources = hasCustomizer ? args.slice( 0, -1 ) : args;
	// Coerce like lodash's assigner so a nullish destination becomes a fresh
	// object rather than being read through — callers that merge into a
	// possibly-absent value get the merged result back.
	const target = Object( object ) as PlainObject;
	for ( const source of sources ) {
		if ( source != null ) {
			baseMergeWith( target, source as PlainObject, customizer, new Map() );
		}
	}
	return target;
}

export default mergeWith;
