/**
 * Internal dependencies
 */
import * as plans from 'lib/plans/constants';
import { getPlan, getPlanPath } from 'lib/plans';

const supportedPlans = [
	plans.PLAN_FREE,
	plans.PLAN_PERSONAL,
	plans.PLAN_PREMIUM,
	plans.PLAN_BUSINESS,
	plans.PLAN_ECOMMERCE,
];

export const freePlan = plans.PLAN_FREE;
export const defaultPaidPlan = plans.PLAN_PREMIUM;

export const supportedPlansPaths: string[] = supportedPlans.map( getPlanPath );

export function getPlanSlugByPath( path?: string ): string | undefined {
	return supportedPlans.find( ( plan ) => getPlanPath( plan ) === path );
}

export function getPlanTitle( planSlug: string ): string {
	return getPlan( planSlug ).getTitle();
}
