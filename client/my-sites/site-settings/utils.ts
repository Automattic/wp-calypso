/**
 * Internal dependencies
 */
import { isEnterprise, isVipPlan, FEATURE_GOOGLE_ANALYTICS } from '@automattic/calypso-products';
import { hasSiteFeature, isEligibleForSEOFeatures } from 'calypso/lib/site/utils';

/**
 * Type dependencies
 */
import type { Plan } from 'calypso/state/plans/types';

type Site = {
	plan: Plan;
};

export function hasSiteAnalyticsFeature(
	site: Site,
	state: string,
	siteId: string
): boolean | undefined {
	if ( state && siteId && ! isEligibleForSEOFeatures( site, state, siteId ) ) {
		return false;
	}

	return (
		hasSiteFeature( site, FEATURE_GOOGLE_ANALYTICS ) ||
		( ( site?.plan && ( isEnterprise( site.plan ) || isVipPlan( site.plan ) ) ) ?? undefined )
	);
}
