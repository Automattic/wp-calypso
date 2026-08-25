import { isEnabled } from '@automattic/calypso-config';
import { addQueryArgs } from '@wordpress/url';
import { wpcomLink } from '../../utils/link';
import { isSimple } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';

export const FREE_DOMAIN_UPSELL_ID = 'omnibar-free-domain';

export type FreeDomainUpsellSurface = 'msd' | 'calypso';

export type FreeDomainUpsellSource = 'free_to_paid_plan' | 'monthly_to_annual_plan';

/**
 * Which sidebar JITM this site would qualify for, or null if not eligible.
 *
 * Mirrors the conditions of the two sidebar JITMs this chip is tested against,
 * which share the "Free domain with an annual plan" message and CTA:
 * - `free_to_paid_plan`: Free plan, Simple, admin, not a domain-only site, no
 *   mapped primary domain.
 * - `monthly_to_annual_plan`: any monthly plan, Simple, admin, no mapped
 *   primary domain.
 * A Simple site with a mapped primary domain keeps its custom-domain slug, so
 * the `.wordpress.com` check covers the mapped-domain rule — and keeps the
 * "Free domain" copy truthful.
 */
export function getFreeDomainUpsellSource( site?: Site ): FreeDomainUpsellSource | null {
	if ( ! isEnabled( 'dashboard/omnibar-free-domain-chip' ) || ! site ) {
		return null;
	}

	if (
		! isSimple( site ) ||
		site.is_wpcom_staging_site ||
		! site.capabilities?.manage_options ||
		! site.slug.endsWith( '.wordpress.com' )
	) {
		return null;
	}

	if ( site.plan?.is_free && ! site.options?.is_domain_only ) {
		return 'free_to_paid_plan';
	}

	if ( site.plan?.billing_period === 'Monthly' ) {
		return 'monthly_to_annual_plan';
	}

	return null;
}

export function isFreeDomainUpsellEligible( site?: Site ): site is Site {
	return getFreeDomainUpsellSource( site ) !== null;
}

export function getFreeDomainUpsellHref( site: Site ) {
	return wpcomLink( addQueryArgs( '/setup/domain-and-plan', { siteSlug: site.slug } ) );
}
