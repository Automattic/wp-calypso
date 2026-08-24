type Many< T > = T | readonly T[];

/**
 * Returns a shallow copy of `object` with only the given own keys. Keys are
 * flat — a dotted string is a literal key, not a deep path.
 */
function pick< T extends object, K extends keyof T >(
	object: T,
	...keys: Many< K >[]
): Pick< T, K >;
function pick< T extends object >(
	object: T | null | undefined,
	...keys: Many< PropertyKey >[]
): Partial< T >;
function pick( object: object | null | undefined, ...keys: Many< PropertyKey >[] ) {
	const result: Record< PropertyKey, unknown > = {};
	if ( object == null ) {
		return result;
	}
	for ( const key of keys.flat() ) {
		if ( Object.prototype.hasOwnProperty.call( object, key ) ) {
			result[ key ] = ( object as Record< PropertyKey, unknown > )[ key ];
		}
	}
	return result;
}

export default pick;
