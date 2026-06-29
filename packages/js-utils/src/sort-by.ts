import baseOrderBy from './base-order-by';
import type { Iteratee } from './base-order-by';

type SortIteratee< T > = Iteratee< T > | ReadonlyArray< Iteratee< T > > | null | undefined;

/**
 * Sorts the values of `collection` in ascending order by each iteratee,
 * matching lodash `sortBy`. Iteratees may be functions or property
 * names/indices (including dotted/bracket paths and path arrays), passed
 * variadically and/or as arrays (flattened one level); a nullish iteratee (or
 * none) sorts by the values themselves. The sort is stable, works on arrays and
 * plain objects (iterating values), and treats a nullish collection as empty.
 * @param collection  The array or object to sort.
 * @param iteratees   The iteratee(s) to sort by.
 * @returns A new sorted array of values.
 */
const sortBy = < T >(
	collection: readonly T[] | Record< PropertyKey, T > | null | undefined,
	...iteratees: Array< SortIteratee< T > >
): T[] => {
	// Flatten the iteratee arguments one level, like lodash `baseFlatten`, so
	// variadic args and array args combine into a single iteratee list.
	const normalized: Array< Iteratee< T > | null | undefined > = [];
	for ( const iteratee of iteratees ) {
		if ( Array.isArray( iteratee ) ) {
			normalized.push( ...( iteratee as ReadonlyArray< Iteratee< T > | null | undefined > ) );
		} else {
			normalized.push( iteratee as Iteratee< T > | null | undefined );
		}
	}
	return baseOrderBy( collection, normalized, [] );
};

export default sortBy;
