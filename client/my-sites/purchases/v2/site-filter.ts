export type PurchasesSection = 'activeUpgrades' | 'billingHistory' | 'paymentMethods';

/** The Dashboard scopes these two screens to a site with a `?site=<blogId>` filter. */
const SITE_FILTERED_SECTIONS: PurchasesSection[] = [ 'activeUpgrades', 'billingHistory' ];

/**
 * Whether this site's filter has to be applied to the current URL.
 *
 * The classic URLs carry the site in the path while the section tabs and the
 * site switcher link to bare paths, so the scope is lost, or left pointing at
 * the site just switched away from, unless it is re-applied on arrival. The
 * Dashboard screens hide the filter control here, so nothing else sets it.
 * @param options         Named options.
 * @param options.section The screen being shown, if it is one of the section tabs.
 * @param options.siteId  Blog ID of the site the classic URL is scoped to.
 * @param options.search  The current query string.
 * @returns Whether the `site` query argument should be set to this site.
 */
export function shouldSeedSiteFilter( {
	section,
	siteId,
	search,
}: {
	section?: PurchasesSection;
	siteId?: number | null;
	search: string;
} ): boolean {
	if ( ! siteId || ! section || ! SITE_FILTERED_SECTIONS.includes( section ) ) {
		return false;
	}

	return new URLSearchParams( search ).get( 'site' ) !== String( siteId );
}
