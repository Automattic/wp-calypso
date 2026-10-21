type Collection< T > = T[] | { [ key in PropertyKey ]: T };

type Iteratee< T, TResult > = TResult | ( ( value: T ) => TResult );

/**
 * Groups the values of `collection` into arrays keyed by the result of running
 * each value through `iteratee`. A function iteratee receives the value; a
 * property-name iteratee reads that single property from each value (deep
 * dot-paths are not supported — pass a function for those); omitting the
 * iteratee groups by the value itself. Insertion order is preserved.
 */
function groupBy< T >(
	collection: Collection< T > | null | undefined,
	iteratee?: Iteratee< T, PropertyKey >
): Record< string, T[] > {
	const values = Array.isArray( collection ) ? collection : Object.values( collection ?? {} );
	const groups = new Map< string, T[] >();

	for ( const value of values ) {
		let rawKey: PropertyKey;
		if ( iteratee === undefined ) {
			rawKey = value as unknown as PropertyKey;
		} else if ( typeof iteratee === 'function' ) {
			rawKey = iteratee( value );
		} else {
			// The string shorthand reads one property, not a dot-separated deep
			// path. Reject those loudly so a `'a.b'` call fails fast instead
			// of silently grouping everything under `undefined`.
			if ( typeof iteratee === 'string' && iteratee.includes( '.' ) ) {
				throw new Error(
					`groupBy(): deep paths like "${ iteratee }" are not supported; pass a function instead.`
				);
			}
			// `?.` keeps the property shorthand null-safe and primitive-tolerant:
			// nullish values yield `undefined` instead of throwing.
			rawKey = ( value as any )?.[ iteratee ];
		}

		// Coerce to a string up front so keys that collide as object keys (e.g.
		// `1` and `'1'`) accumulate into the same group.
		const key = String( rawKey );
		const group = groups.get( key );
		if ( group ) {
			group.push( value );
		} else {
			groups.set( key, [ value ] );
		}
	}

	return Object.fromEntries( groups );
}

export default groupBy;
