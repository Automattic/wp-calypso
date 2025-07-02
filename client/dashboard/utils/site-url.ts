import type { Site } from '../data/types';

/**
 * Returns a user-friendly version of the site's URL.
 *
 * This not only produces a clean version of the site's domain, but
 * also deals with the case of Jetpack multi-sites using subdirectory
 * installations.
 */
export function getSiteDisplayUrl( site: Site ) {
	return site.URL.replace( 'https://', '' ).replace( 'http://', '' );
}
