/**
 * Returns a shallow copy of `object` without the own enumerable string-keyed
 * entries for which `predicate( value, key, object )` is truthy. Defaults to
 * dropping truthy values.
 */
function omitBy< T >(
	object: Record< string, T > | null | undefined,
	predicate: ( value: T, key: string, object: Record< string, T > ) => unknown = Boolean
): Record< string, T > {
	const source: Record< string, T > = object ?? {};
	return Object.fromEntries(
		Object.entries( source ).filter( ( [ key, value ] ) => ! predicate( value, key, source ) )
	);
}

export default omitBy;
