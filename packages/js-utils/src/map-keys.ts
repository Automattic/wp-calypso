/**
 * Returns a new object with the same own enumerable string-keyed values as
 * `object`, each key replaced by `iteratee( value, key, object )`. A function
 * iteratee is required — unlike lodash there is no property-name shorthand or
 * identity default. When the iteratee maps two keys to the same value, the last
 * one wins.
 */
function mapKeys< T >(
	object: Record< string, T > | null | undefined,
	iteratee: ( value: T, key: string, object: Record< string, T > ) => PropertyKey
): Record< string, T > {
	const source: Record< string, T > = object ?? {};
	return Object.fromEntries(
		Object.entries( source ).map( ( [ key, value ] ): [ PropertyKey, T ] => [
			iteratee( value, key, source ),
			value,
		] )
	);
}

export default mapKeys;
