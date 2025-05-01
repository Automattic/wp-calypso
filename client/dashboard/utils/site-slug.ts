import type { Site } from '../data/types';

export function getSiteSlug( site: Site ) {
	let url = site.URL;
	if ( site.options?.is_redirect && site.options?.unmapped_url ) {
		url = site.options?.unmapped_url;
	}

	return new URL( url ).hostname;
}
