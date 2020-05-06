/**
 * Internal dependencies
 */
import { getPlan } from '../../../../lib/plans';

export type Plan = ReturnType< typeof getPlan >;

export type PlanAction = {
	type: string;
	plan?: Plan;
};
