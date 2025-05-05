/**
 * Converts the specified date string to a timestamp.
 *
 * @param date A date formatted as 'YYYY-MM-DD HH:MM:SS' (e.g. '2025-04-29 14:21:38')
 * @returns The timestamp in seconds (e.g. 1714395698)
 */
export function getTimestamp( date: string ): number {
	// Replaces the space with 'T' and append 'Z' to indicate UTC time
	const ts = Date.parse( date.replace( ' ', 'T' ) + 'Z' );

	return Math.floor( ts / 1000 );
}
