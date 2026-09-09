export type PurchasesSection = 'activeUpgrades' | 'billingHistory' | 'paymentMethods';

/** The Dashboard scopes these two screens to a site with a `?site=<blogId>` filter. */
const SITE_FILTERED_SECTIONS: PurchasesSection[] = [ 'activeUpgrades', 'billingHistory' ];

/**
 * Whether arriving on a screen should re-apply this site's filter.
 *
 * The classic URLs carry the site in the path and the section tabs link to bare
 * paths, so without this the site scope is lost every time you move between
 * tabs. Seeding only on arrival — rather than whenever the filter is missing —
 * is what lets someone widen the filter in place without it snapping straight
 * back to this site.
 * @param options                 Named options.
 * @param options.section         The screen being shown, if it is one of the section tabs.
 * @param options.previousSection The screen shown before this one.
 * @param options.siteId          Blog ID of the site the classic URL is scoped to.
 * @param options.search          The current query string.
 * @returns Whether the `site` query argument should be added.
 */
export function shouldSeedSiteFilter( {
	section,
	previousSection,
	siteId,
	search,
}: {
	section?: PurchasesSection;
	previousSection?: PurchasesSection;
	siteId?: number | null;
	search: string;
} ): boolean {
	const isArriving = section !== previousSection;
	if ( ! isArriving || ! siteId || ! section || ! SITE_FILTERED_SECTIONS.includes( section ) ) {
		return false;
	}

	return ! new URLSearchParams( search ).has( 'site' );
}
