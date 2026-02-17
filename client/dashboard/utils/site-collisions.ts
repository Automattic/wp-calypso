import { urlToSlug, withoutHttp } from './url';
import type { Site } from '@automattic/api-core';

/**
 * Returns effective slug for a site. When a wpcom site's URL collides with a Jetpack site's URL
 * (or is a redirect), returns the unmapped_url to avoid API resolution to the wrong blog ID.
 * Otherwise returns the original slug.
 */
export function getEffectiveSiteSlug( site: Site, jetpackUrls: Set< string > ): string {
	const isConflicting = ! site.jetpack && jetpackUrls.has( withoutHttp( site.URL ) );

	if ( isConflicting || site.options?.is_redirect ) {
		const unmappedUrl = site.options?.unmapped_url;
		if ( unmappedUrl ) {
			return urlToSlug( unmappedUrl );
		}
	}

	return site.slug;
}
