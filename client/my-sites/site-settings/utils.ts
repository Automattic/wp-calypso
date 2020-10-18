/**
 * Internal dependencies
 */
import { isEnterprise, isVipPlan } from 'calypso/lib/products-values';
import { FEATURE_GOOGLE_ANALYTICS } from 'calypso/lib/plans/constants';
import { hasSiteFeature } from 'calypso/lib/site/utils';

/**
 * Type dependencies
 */
import type { Plan } from 'calypso/state/plans/types';

type Site = {
	plan: Plan;
};

export function hasSiteAnalyticsFeature( site: Site ): boolean | undefined {
	return (
		hasSiteFeature( site, FEATURE_GOOGLE_ANALYTICS ) ||
		( ( site?.plan && ( isEnterprise( site.plan ) || isVipPlan( site.plan ) ) ) ?? undefined )
	);
}
