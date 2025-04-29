import { urlToSlug } from 'calypso/lib/url/http-utils';
import type { Site } from '../data/types';

export function getSiteSlug( site: Site ) {
	if ( site.options?.is_redirect ) {
		return withoutHttp( site.options?.unmapped_url ?? '' );
	}
	return urlToSlug( site.URL );
}
