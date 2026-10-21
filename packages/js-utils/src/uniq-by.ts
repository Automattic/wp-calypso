type Iteratee< T, TResult > = TResult | ( ( value: T ) => TResult );

const uniqBy = < T >( array: T[], iteratee: Iteratee< T, PropertyKey > ): T[] => {
	const seen = new Set< unknown >();

	return ( array || [] ).filter( ( value ) => {
		// `?.` keeps the property shorthand null-safe: nullish elements dedupe to
		// a single `undefined` key instead of throwing.
		const key: unknown =
			typeof iteratee === 'function' ? iteratee( value ) : ( value as any )?.[ iteratee ];

		if ( seen.has( key ) ) {
			return false;
		}
		seen.add( key );
		return true;
	} );
};

export default uniqBy;
