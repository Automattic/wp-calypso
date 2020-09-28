/**
 * External dependencies
 */
import { overSome } from 'lodash';

/**
 * Internal dependencies
 */
import {
	isBusiness,
	isEnterprise,
	isJetpackPremium,
	isJetpackBusiness,
	isEcommerce,
} from 'lib/products-values';

/**
 * Type dependencies
 */
import type { Plan } from 'state/plans/types';

type Site = {
	plan: Plan;
};

const hasSupportingPlan = overSome(
	isBusiness,
	isEnterprise,
	isJetpackBusiness,
	isJetpackPremium,
	isEcommerce
);

export function hasSiteSeoFeature( site: Site ): boolean | undefined {
	return ( site && site.plan && hasSupportingPlan( site.plan ) ) ?? undefined;
}
