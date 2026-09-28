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
	if ( object == null ) {
		return {};
	}
	const source = object as Record< PropertyKey, unknown >;
	// `Object.fromEntries` defines own data properties, so an own `__proto__`
	// key is copied as data instead of invoking the inherited setter.
	return Object.fromEntries(
		keys
			.flat()
			.filter( ( key ) => Object.prototype.hasOwnProperty.call( source, key ) )
			.map( ( key ) => [ key, source[ key ] ] )
	);
}

export default pick;
