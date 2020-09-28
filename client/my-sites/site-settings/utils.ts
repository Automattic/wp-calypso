/**
 * Internal dependencies
 */
import { isEnterprise, isVipPlan } from 'lib/products-values';
import { FEATURE_GOOGLE_ANALYTICS } from 'lib/plans/constants';
import { hasSiteFeature } from 'lib/site/utils';

/**
 * Type dependencies
 */
import type { Plan } from 'state/plans/types';

type Site = {
	plan: Plan;
};

export function hasSiteAnalyticsFeature( site: Site ): boolean | undefined {
	return (
		hasSiteFeature( site, FEATURE_GOOGLE_ANALYTICS ) ||
		( ( site?.plan && ( isEnterprise( site.plan ) || isVipPlan( site.plan ) ) ) ?? undefined )
	);
}
