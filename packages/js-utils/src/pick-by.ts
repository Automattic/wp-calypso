/**
 * Returns a shallow copy of `object` with only the own enumerable string-keyed
 * entries for which `predicate( value, key, object )` is truthy. Defaults to
 * keeping truthy values.
 */
function pickBy< T >(
	object: Record< string, T > | null | undefined,
	predicate: ( value: T, key: string, object: Record< string, T > ) => unknown = Boolean
): Record< string, T > {
	const source: Record< string, T > = object ?? {};
	return Object.fromEntries(
		Object.entries( source ).filter( ( [ key, value ] ) => predicate( value, key, source ) )
	);
}

export default pickBy;
