export function isCustomDomain( siteSlug: string | null | undefined ): boolean {
	if ( ! siteSlug ) {
		return false;
	}
	return ! siteSlug.endsWith( '.wordpress.com' ) && ! siteSlug.endsWith( '.wpcomstaging.com' );
}
