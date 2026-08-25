import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { wpcomLink } from '../../utils/link';
import { isSimple } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';

export const FREE_DOMAIN_UPSELL_ID = 'omnibar-free-domain';

export type FreeDomainUpsellSurface = 'msd' | 'calypso';

/**
 * Mirrors the conditions of the two sidebar JITMs this chip is tested against,
 * which share the "Free domain with an annual plan" message and CTA:
 * - `free_to_paid_plan`: Free plan, Simple, admin, not a domain-only site, no
 *   mapped domain.
 * - `monthly_to_annual_plan`: any monthly plan, Simple, admin, no mapped
 *   domain.
 * A Simple site with a mapped domain keeps its custom-domain slug, so the
 * `.wordpress.com` check covers the mapped-domain rule — and keeps the "Free
 * domain" copy truthful.
 */
export function isFreeDomainUpsellEligible( site?: Site ): site is Site {
	if ( ! isEnabled( 'dashboard/omnibar-free-domain-chip' ) || ! site ) {
		return false;
	}

	const matchesFreeToPaid = !! site.plan?.is_free && ! site.options?.is_domain_only;
	const matchesMonthlyToAnnual = site.plan?.billing_period === 'Monthly';

	return (
		( matchesFreeToPaid || matchesMonthlyToAnnual ) &&
		isSimple( site ) &&
		! site.is_wpcom_staging_site &&
		!! site.capabilities?.manage_options &&
		site.slug.endsWith( '.wordpress.com' )
	);
}

export function getFreeDomainUpsellHref( site: Site ) {
	return wpcomLink( addQueryArgs( '/setup/domain-and-plan', { siteSlug: site.slug } ) );
}
