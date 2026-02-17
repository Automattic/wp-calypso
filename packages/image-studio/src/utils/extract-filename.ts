/**
 * Extracts the filename from a URL, handling various edge cases.
 * @param url      - The URL to extract filename from
 * @param fallback - Fallback value if extraction fails (defaults to 'Untitled')
 * @returns The extracted and decoded filename
 */
export function extractFilenameFromUrl(
	url: string | null | undefined,
	fallback: string = 'Untitled'
): string {
	if ( ! url ) {
		return fallback;
	}

	try {
		// Use URL API for proper parsing (pathname is always without query params)
		const urlObj = new URL( url, window.location.origin );
		const pathname = urlObj.pathname;
		const extracted = pathname.substring( pathname.lastIndexOf( '/' ) + 1 );

		// Decode URI component to handle encoded characters
		const decoded = decodeURIComponent( extracted );

		return decoded || fallback;
	} catch ( error ) {
		// Fallback to simple split-based extraction
		try {
			const parts = url.split( '/' ).pop()?.split( '?' )[ 0 ] || '';
			return decodeURIComponent( parts ) || fallback;
		} catch {
			return fallback;
		}
	}
}
