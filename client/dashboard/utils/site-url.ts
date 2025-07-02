import type { Site } from '../data/types';

/**
 * Returns the site's URL without the protocol.
 *
 * This is useful for displaying the site's URL in a user-friendly way.
 * Note that we cannot just return the URL's hostname, because the URL
 * could contain the path to the site's subdirectory in case of multi-site
 * installations.
 */
export function getSiteDisplayUrl( site: Site ) {
	return site.URL.replace( 'https://', '' ).replace( 'http://', '' );
}
