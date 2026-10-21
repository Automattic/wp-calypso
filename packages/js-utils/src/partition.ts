/**
 * Splits the values of `collection` into two groups: the first contains values
 * for which `predicate` returns truthy, the second the rest. Works on arrays
 * and plain objects (iterating values) and treats a nullish collection as
 * empty.
 * @param collection The array or object to iterate over.
 * @param predicate  Invoked per value.
 * @returns A tuple of `[ truthy, falsy ]` value arrays.
 */
const partition = < T >(
	collection: readonly T[] | Record< PropertyKey, T > | null | undefined,
	predicate: ( value: T ) => boolean
): [ T[], T[] ] => {
	const truthy: T[] = [];
	const falsy: T[] = [];

	let values: readonly T[];
	if ( collection == null ) {
		values = [];
	} else if ( Array.isArray( collection ) ) {
		values = collection;
	} else {
		values = Object.values( collection );
	}

	for ( const value of values ) {
		( predicate( value ) ? truthy : falsy ).push( value );
	}

	return [ truthy, falsy ];
};

export default partition;
