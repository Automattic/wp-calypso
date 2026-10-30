/**
 * Returns the site page a domain was opened from, so the sidebar can go one level up.
 */
export function getBackToSitePath( backTo: string | undefined, siteSlug: string ) {
	switch ( backTo ) {
		case 'site-overview':
			return `/sites/${ siteSlug }`;
		case 'site-domains':
			return `/sites/${ siteSlug }/domains`;
		default:
			return null;
	}
}
