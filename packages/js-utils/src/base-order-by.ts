import isSymbol from './is-symbol';
import castPath from './to-path';

export type Order = 'asc' | 'desc';
export type Iteratee< T > =
	| ( ( value: T ) => unknown )
	| string
	| number
	| ReadonlyArray< string | number >;

interface Decorated< T > {
	criteria: unknown[];
	index: number;
	value: T;
}

// Orders two values with `undefined` after defined, `null` after non-null,
// `NaN` last, and symbols after comparable values, so mixed/missing criteria
// sort deterministically. The `as number` casts only satisfy the relational
// operators; at runtime the native comparison handles strings, dates, etc.
// correctly.
const compareAscending = ( value: unknown, other: unknown ): number => {
	if ( value !== other ) {
		const valIsDefined = value !== undefined;
		const valIsNull = value === null;
		const valIsReflexive = ! Number.isNaN( value as number );
		const valIsSymbol = isSymbol( value );
		const othIsDefined = other !== undefined;
		const othIsNull = other === null;
		const othIsReflexive = ! Number.isNaN( other as number );
		const othIsSymbol = isSymbol( other );

		if (
			( ! othIsNull &&
				! othIsSymbol &&
				! valIsSymbol &&
				( value as number ) > ( other as number ) ) ||
			( valIsSymbol && othIsDefined && othIsReflexive && ! othIsNull && ! othIsSymbol ) ||
			( valIsNull && othIsDefined && othIsReflexive ) ||
			( ! valIsDefined && othIsReflexive ) ||
			! valIsReflexive
		) {
			return 1;
		}
		if (
			( ! valIsNull &&
				! valIsSymbol &&
				! othIsSymbol &&
				( value as number ) < ( other as number ) ) ||
			( othIsSymbol && valIsDefined && valIsReflexive && ! valIsNull && ! valIsSymbol ) ||
			( othIsNull && valIsDefined && valIsReflexive ) ||
			( ! othIsDefined && valIsReflexive ) ||
			! othIsReflexive
		) {
			return -1;
		}
	}
	return 0;
};

const baseGet = (
	value: unknown,
	path: string | number | ReadonlyArray< string | number >
): unknown => {
	const segments = castPath( path, value );
	let index = 0;
	let current = value;
	while ( current != null && index < segments.length ) {
		current = ( current as Record< PropertyKey, unknown > )[ segments[ index++ ] ];
	}
	return index && index === segments.length ? current : undefined;
};

const identity = ( value: unknown ): unknown => value;

const resolveIteratee = < T >(
	iteratee: Iteratee< T > | null | undefined
): ( ( value: T ) => unknown ) => {
	if ( iteratee == null ) {
		// A nullish iteratee sorts by identity.
		return identity;
	}
	if ( typeof iteratee === 'function' ) {
		return iteratee;
	}
	// A property name, index, or path — resolved per value (`castPath` is
	// object-dependent: a literal key present on the value is used whole).
	return ( value ) => baseGet( value, iteratee );
};

const compareMultiple = < T >(
	object: Decorated< T >,
	other: Decorated< T >,
	orders: readonly Order[]
): number => {
	const { criteria } = object;
	const otherCriteria = other.criteria;
	for ( let index = 0; index < criteria.length; index++ ) {
		const result = compareAscending( criteria[ index ], otherCriteria[ index ] );
		if ( result ) {
			if ( index >= orders.length ) {
				return result;
			}
			return result * ( orders[ index ] === 'desc' ? -1 : 1 );
		}
	}
	// Tie-break by original index to keep the sort stable.
	return object.index - other.index;
};

/**
 * Shared core for `sortBy`/`orderBy`. Decorates each value of `collection` with
 * its iteratee `criteria` and original index, sorts by `compareMultiple`
 * (honoring per-criterion `orders`), and returns the values. Works on arrays
 * and plain objects (iterating values); a nullish collection yields `[]`.
 * Internal helper; not part of the public API.
 */
const baseOrderBy = < T >(
	collection: readonly T[] | Record< PropertyKey, T > | null | undefined,
	iteratees: ReadonlyArray< Iteratee< T > | null | undefined >,
	orders: readonly Order[]
): T[] => {
	let values: readonly T[];
	if ( collection == null ) {
		values = [];
	} else if ( Array.isArray( collection ) ) {
		// `Array.from` materializes holes in sparse arrays as `undefined`, so they
		// are sorted (last) rather than skipped by `map`.
		values = Array.from( collection );
	} else {
		values = Object.values( collection );
	}

	const resolved = ( iteratees.length ? iteratees : [ identity ] ).map( resolveIteratee );

	const decorated: Decorated< T >[] = values.map( ( value, index ) => ( {
		criteria: resolved.map( ( iteratee ) => iteratee( value ) ),
		index,
		value,
	} ) );

	decorated.sort( ( a, b ) => compareMultiple( a, b, orders ) );

	return decorated.map( ( entry ) => entry.value );
};

export default baseOrderBy;
