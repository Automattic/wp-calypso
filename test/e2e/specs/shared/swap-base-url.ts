/**
 * Swaps the base URL of a given URL to a new base URL.
 * @param url The URL to swap the base URL of.
 * @param newBaseUrl The new base URL to swap the base URL of the given URL to.
 * @returns The URL with the swapped base URL.
 */
export function swapBaseUrl( url: string, newBaseUrl: string ) {
	const urlObject = new URL( url );

	const baseUrl = new URL( newBaseUrl );

	urlObject.protocol = baseUrl.protocol;
	urlObject.host = baseUrl.host;
	return urlObject.toString();
}
