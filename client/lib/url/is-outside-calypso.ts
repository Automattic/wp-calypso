/**
 * Internal dependencies
 */
import { URL as URLString } from 'types';

/**
 * Check if a URL is located outside of Calypso.
 * Note that the check this function implements is incomplete --
 * it only returns false for absolute URLs, so it misses
 * relative URLs, or pure query strings, or hashbangs.
 *
 * @param  url URL to check
 * @returns     true if the given URL is located outside of Calypso
 */
export default function isOutsideCalypso( url: URLString ): boolean {
	return !! url && ( url.startsWith( '//' ) || ! url.startsWith( '/' ) );
}
