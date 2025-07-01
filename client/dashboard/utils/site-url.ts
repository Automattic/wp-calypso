import type { Site } from '../data/types';

export function getSiteHostname( site: Site ) {
	if ( site.URL === '' ) {
		return site.URL;
	}
	return new URL( site.URL ).hostname;
}
