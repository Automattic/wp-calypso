import config, { isEnabled } from '@automattic/calypso-config';
import { isSupportSession } from '@automattic/calypso-support-session';
import { addQueryArgs } from '@wordpress/url';
import { useExperiment } from 'calypso/lib/explat';
import { wpcomLink } from '../../utils/link';
import { isSimple } from '../../utils/site-types';
import type { Site } from '@automattic/api-core';

export const FREE_DOMAIN_UPSELL_ID = 'omnibar-free-domain';

export const FREE_DOMAIN_UPSELL_EXPERIMENT = 'calypso_omnibar_free_domain_upsell_20260825';

const QUERY_PARAM = 'omnibar_free_domain';

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

/**
 * ExPlat gate for the omnibar free-domain chip. The treatment shows the chip
 * on every omnibar surface and (server-side, via jetpack-mu-wpcom) hides the
 * `free_to_paid_plan` and `monthly_to_annual_plan` sidebar banners in
 * wp-admin; control keeps the banners.
 *
 * Eligibility is deliberately reactive, not frozen at mount: the omnibar
 * mounts before the selected site resolves, so eligibility flips false -> true
 * once site data arrives (and again when switching sites in the dashboard).
 * `useExperiment` only requests an assignment while eligible, which keeps
 * enrollment scoped to users who could actually see the chip.
 *
 * Teardown: everything belonging to this experiment falls out of
 * `grep -rEi 'free[-_]?domain[-_]?(upsell|chip)'` — identifiers
 * (`FreeDomainUpsell`), CSS classes and file names (`free-domain-chip`,
 * `omnibar__free-domain`), the feature flag
 * (`dashboard/omnibar-free-domain-chip`), the experiment name, and the
 * `omnibar_free_domain` query param.
 */
export function useFreeDomainUpsellExperiment( site?: Site ): {
	isLoading: boolean;
	showChip: boolean;
} {
	const isEligible = isFreeDomainUpsellEligible( site );
	const [ isLoading, assignment ] = useExperiment( FREE_DOMAIN_UPSELL_EXPERIMENT, {
		isEligible,
	} );

	if ( ! isEligible ) {
		return { isLoading: false, showChip: false };
	}

	// QA override. Dead on production builds (except inside a support session)
	// so regular users can't force treatment UI — and its treatment-only Tracks
	// events — outside a real assignment.
	const canUseQaOverride =
		! String( config( 'env_id' ) ?? '' ).endsWith( 'production' ) || isSupportSession();
	if ( canUseQaOverride && typeof window !== 'undefined' ) {
		const searchParams = new URLSearchParams( window.location.search );
		if ( searchParams.get( QUERY_PARAM ) === '1' ) {
			return { isLoading: false, showChip: true };
		}
	}

	if ( isLoading ) {
		return { isLoading: true, showChip: false };
	}

	return { isLoading: false, showChip: assignment?.variationName === 'treatment' };
}
