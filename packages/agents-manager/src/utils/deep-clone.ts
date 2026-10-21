/**
 * A JSON round trip: the copy shares no reference with the live value, and
 * nothing non-serializable survives into it. A value JSON cannot represent at
 * all, such as `undefined`, comes back as it is.
 */
export function deepClone< T >( value: T ): T {
	const json = JSON.stringify( value );

	return json === undefined ? value : JSON.parse( json );
}
