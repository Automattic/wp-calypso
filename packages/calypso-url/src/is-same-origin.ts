/**
 * Check if a URL is on the same origin as the current page.
 *
 * @param path - The URL to check.
 * @returns True if the URL is on the same origin as the current page, false otherwise.
 */
export function isSameOrigin( path: string ): boolean {
	return new URL( path, window.location.href ).origin === window.location.origin;
}
