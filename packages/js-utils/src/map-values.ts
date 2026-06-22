/**
 * Returns a new object with the same own enumerable string keys as `object`,
 * each value replaced by `iteratee( value, key, object )`.
 */
function mapValues< T, R >(
	object: Record< string, T > | null | undefined,
	iteratee: ( value: T, key: string, object: Record< string, T > ) => R
): Record< string, R > {
	const source: Record< string, T > = object ?? {};
	return Object.fromEntries(
		Object.entries( source ).map( ( [ key, value ] ): [ string, R ] => [
			key,
			iteratee( value, key, source ),
		] )
	);
}

export default mapValues;
