/**
 * Internal dependencies
 */
import * as plans from 'lib/plans/constants';
import { getPlanPath } from 'lib/plans';

export const supportedPlans: string[] = [
	plans.PLAN_FREE,
	plans.PLAN_PERSONAL,
	plans.PLAN_PREMIUM,
	plans.PLAN_BUSINESS,
	plans.PLAN_ECOMMERCE,
];

export const supportedPlansPaths: string[] = supportedPlans.map( getPlanPath );
