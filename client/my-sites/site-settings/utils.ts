/**
 * Internal dependencies
 */
import {
	isEnterprise,
	isVipPlan,
	FEATURE_GOOGLE_ANALYTICS,
	FEATURE_ADVANCED_SEO,
	isFreePlan,
} from '@automattic/calypso-products';
import { hasSiteFeature } from 'calypso/lib/site/utils';
import isSiteWPCOM from 'calypso/state/selectors/is-site-wpcom';

/**
 * Type dependencies
 */
import type { Plan } from 'calypso/state/plans/types';

type Site = {
	plan: Plan;
};

/**
 * Returns true if the site is on a free plan and a WPCOM site (Simple or Atomic).
 *
 * @param site The site to check.
 * @param state Global state tree.
 * @param siteId Site ID to check.
 * @returns bool True if the site is on a free pln and a WPCOM site, false otherwise.
 */
export function isFreeWPCOMSite( site: Site, state: string, siteId: string ): boolean | null {
	if ( ! ( site && site.plan && state ) ) {
		return false;
	}

	return isFreePlan( site.plan.product_slug ) && isSiteWPCOM( state, siteId );
}

export function hasSiteAnalyticsFeature(
	site: Site,
	state: string,
	siteId: string
): boolean | undefined {
	if ( state && siteId && isFreeWPCOMSite( site, state, siteId ) ) {
		return false;
	}

	return (
		hasSiteFeature( site, FEATURE_GOOGLE_ANALYTICS ) ||
		( ( site?.plan && ( isEnterprise( site.plan ) || isVipPlan( site.plan ) ) ) ?? undefined )
	);
}

export function hasSiteSeoFeature(
	site: Site,
	state: string,
	siteId: string
): boolean | undefined {
	if ( state && siteId && isFreeWPCOMSite( site, state, siteId ) ) {
		return false;
	}

	return (
		hasSiteFeature( site, FEATURE_ADVANCED_SEO ) ||
		( ( site?.plan && isEnterprise( site.plan ) ) ?? undefined )
	);
}
