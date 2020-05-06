/**
 * External dependencies
 */
import { ValuesType } from 'utility-types';

/**
 * Internal dependencies
 */
import * as plans from 'lib/plans/constants';
import { getPlan, getPlanPath } from 'lib/plans';

export type Plan = ValuesType< typeof plans > | undefined;

export const supportedPlans: Plan[] = [
	plans.PLAN_FREE,
	plans.PLAN_PERSONAL,
	plans.PLAN_PREMIUM,
	plans.PLAN_BUSINESS,
	plans.PLAN_ECOMMERCE,
];

export const freePlan = plans.PLAN_FREE;
export const defaultPaidPlan = plans.PLAN_PREMIUM;

export const supportedPlansPaths: Plan[] = supportedPlans.map( getPlanPath );

export function getPlanSlugByPath( path?: string ): Plan | undefined {
	return supportedPlans.find( ( plan ) => getPlanPath( plan ) === path );
}

export function getPlanTitle( planSlug: Plan ): string {
	return getPlan( planSlug ).getTitle();
}
