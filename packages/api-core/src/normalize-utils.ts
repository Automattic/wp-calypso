/**
 * Converts a value to a number if it's a string representation of a number.
 * Preserves null, undefined, and actual numbers as-is.
 */
export function toNumber< T >( value: T ): T {
	if ( typeof value === 'string' && value !== '' && ! isNaN( Number( value ) ) ) {
		return Number( value ) as T;
	}
	return value;
}
