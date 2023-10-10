import { TYPE_BUSINESS, PLAN_HOSTING_TRIAL_MONTHLY } from '@automattic/calypso-products';
import { useMemo } from 'react';
import { UseFreeTrialPlanSlugs } from 'calypso/my-sites/plans-grid/hooks/npm-ready/data-store/use-grid-plans';

export const useFreeTrialPlanSlugs: UseFreeTrialPlanSlugs = ( {
	intent,
	eligibleForFreeHostingTrial,
} ) => {
	return useMemo( () => {
		const freeTrialSlugs: ReturnType< UseFreeTrialPlanSlugs > = {};

		if ( intent === 'plans-new-hosted-site' && eligibleForFreeHostingTrial ) {
			freeTrialSlugs[ TYPE_BUSINESS ] = PLAN_HOSTING_TRIAL_MONTHLY;
		}

		return freeTrialSlugs;
	}, [ eligibleForFreeHostingTrial, intent ] );
};
