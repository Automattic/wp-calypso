/**
 * A JSON round trip: the copy shares no reference with the live value, and
 * nothing non-serializable survives into it.
 */
export const deepClone = < T >( value: T ): T => JSON.parse( JSON.stringify( value ) );
