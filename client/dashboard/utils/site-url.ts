import type { Site } from '../data/types';

export function getSiteDisplayUrl( site: Site ) {
	if ( site.URL === '' ) {
		return site.URL;
	}
	return site.URL.replace( 'https://', '' ).replace( 'http://', '' );
}
