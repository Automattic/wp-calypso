function defaults< T extends object, S extends object >( object: T, source: S ): T & S;
function defaults< T extends object, S1 extends object, S2 extends object >(
	object: T,
	source1: S1,
	source2: S2
): T & S1 & S2;
function defaults< T extends object >(
	object: T,
	...sources: Array< object | null | undefined >
): T;

/**
 * Assigns own enumerable properties of the source objects to `object` for every
 * destination property that is `undefined`, matching lodash `defaults`. Earlier
 * sources take precedence, `object` always wins over sources, and `object` is
 * mutated and returned.
 * @param object  The destination object (mutated).
 * @param sources The source objects.
 * @returns `object`.
 */
function defaults(
	object: Record< string, unknown > | null | undefined,
	...sources: Array< object | null | undefined >
): object {
	const objectProto = Object.prototype as Record< string, unknown >;
	const hasOwn = Object.prototype.hasOwnProperty;

	// `Object()` coerces a nullish destination to `{}`, like lodash.
	const target = Object( object ) as Record< string, unknown >;
	for ( const source of sources ) {
		if ( source == null ) {
			continue;
		}
		// Iterate own and inherited enumerable keys (lodash uses `keysIn`).
		// eslint-disable-next-line guard-for-in
		for ( const key in source ) {
			const value = target[ key ];
			// Assign when the destination resolves to `undefined`, or to an
			// inherited `Object.prototype` value that isn't an own property (e.g.
			// `constructor`, `toString`) — matching lodash `customDefaultsAssignIn`.
			if (
				value === undefined ||
				( value === objectProto[ key ] && ! hasOwn.call( target, key ) )
			) {
				target[ key ] = ( source as Record< string, unknown > )[ key ];
			}
		}
	}
	return target;
}

export default defaults;
