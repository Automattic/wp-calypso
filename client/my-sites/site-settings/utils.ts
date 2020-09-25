/**
 * External dependencies
 */
import { overSome } from 'lodash';

/**
 * Internal dependencies
 */
import { isBusiness, isEnterprise, isPremium, isVipPlan, isEcommerce } from 'lib/products-values';

/**
 * Type dependencies
 */
import type { Plan } from 'state/plans/types';

type Site = {
	plan: Plan;
};

const hasSupportingPlan = overSome( isPremium, isBusiness, isEcommerce, isEnterprise, isVipPlan );

export function hasSiteAnalyticsFeature( site: Site ): boolean | undefined {
	return ( site && site.plan && hasSupportingPlan( site.plan ) ) ?? undefined;
}
