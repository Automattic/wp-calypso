type Many< T > = T | readonly T[];

/**
 * Returns a shallow copy of `object` without the given own keys. Keys are
 * flat — a dotted string is a literal key, not a deep path.
 */
function omit< T extends object, K extends keyof T >(
	object: T,
	...keys: Many< K >[]
): Omit< T, K >;
function omit< T extends object >(
	object: T | null | undefined,
	...keys: Many< PropertyKey >[]
): Partial< T >;
function omit( object: object | null | undefined, ...keys: Many< PropertyKey >[] ) {
	if ( object == null ) {
		return {};
	}
	// `Object.assign` shallow-copies own enumerable props (including symbols);
	// `delete` then removes each key, coercing numeric keys to strings natively.
	const result = Object.assign( {}, object ) as Record< PropertyKey, unknown >;
	for ( const key of keys.flat() ) {
		delete result[ key ];
	}
	return result;
}

export default omit;
