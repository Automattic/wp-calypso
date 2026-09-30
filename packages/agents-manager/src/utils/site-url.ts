import type { AgentsManagerSite } from '@automattic/data-stores';

/** The site's URL, from what the host supplied, else the page's own. */
export function getSiteUrl(
	site?: Partial< Pick< AgentsManagerSite, 'URL' | 'domain' > > | null
): string {
	if ( site?.URL ) {
		return site.URL;
	}

	if ( site?.domain ) {
		return /^https?:\/\//.test( site.domain ) ? site.domain : `https://${ site.domain }`;
	}

	return window.location.href;
}
