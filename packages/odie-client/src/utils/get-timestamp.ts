/**
 * Converts the specified date string to a timestamp.
 *
 * @param date A date formatted as 'YYYY-MM-DD HH:MM:SS' (e.g. '2025-04-29 14:21:38')
 * @returns The timestamp in seconds (e.g. 1745936539)
 */
export function getTimestamp( date: string ): number {
	// Ensures the date string is in ISO 8601 format for reliable parsing across browsers
	const ts = Date.parse( date.replace( ' ', 'T' ) + 'Z' );

	return Math.floor( ts / 1000 );
}
