import { useSite } from './use-site';
import { useSiteSlugParam } from './use-site-slug-param';

export function useSiteSlug() {
	const siteSlugParam = useSiteSlugParam();
	const site = useSite();

	let siteSlug: string | null = null;
	if ( siteSlugParam ) {
		siteSlug = siteSlugParam;
	} else if ( site ) {
		siteSlug = new URL( site.URL ).host;
	}

	return siteSlug;
}
