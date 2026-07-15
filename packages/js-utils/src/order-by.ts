import baseOrderBy from './base-order-by';
import type { Iteratee, Order } from './base-order-by';

/**
 * Like `sortBy`, but allows specifying a sort order (`'asc'` or `'desc'`) per
 * iteratee. Iteratees may be functions or property
 * names/indices (including dotted/bracket paths and path arrays); a nullish
 * iteratee (or none) sorts by the values themselves. Orders shorter than the
 * iteratee list default to ascending. The sort is stable, works on arrays and
 * plain objects (iterating values), and treats a nullish collection as empty.
 * @param collection The array or object to sort.
 * @param iteratees  The iteratee(s) to sort by.
 * @param orders     The sort order(s), aligned with `iteratees`.
 * @returns A new sorted array of values.
 */
const orderBy = < T >(
	collection: readonly T[] | Record< PropertyKey, T > | null | undefined,
	iteratees?: Iteratee< T > | ReadonlyArray< Iteratee< T > > | null,
	orders?: Order | ReadonlyArray< Order > | null
): T[] => {
	// A nullish (single or array) argument normalizes to an empty list.
	let normalizedIteratees: ReadonlyArray< Iteratee< T > >;
	if ( iteratees == null ) {
		normalizedIteratees = [];
	} else {
		normalizedIteratees = Array.isArray( iteratees ) ? iteratees : [ iteratees ];
	}
	let normalizedOrders: readonly Order[];
	if ( orders == null ) {
		normalizedOrders = [];
	} else {
		normalizedOrders = Array.isArray( orders ) ? orders : [ orders ];
	}
	return baseOrderBy( collection, normalizedIteratees, normalizedOrders );
};

export default orderBy;
